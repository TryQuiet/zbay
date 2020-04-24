import getSize from 'get-folder-size'
import checkDiskSpace from 'check-disk-space'
import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  globalShortcut,
  powerSaveBlocker
} from 'electron'
import os from 'os'
import path from 'path'
import url from 'url'
import { autoUpdater } from 'electron-updater'
import fs from 'fs-extra'
import axios from 'axios'
import request from 'request'
import zlib from 'zlib'
import progress from 'request-progress'
import convert from 'convert-seconds'
import R from 'ramda'
import findInFiles from 'find-in-files'
import readLastLines from 'read-last-lines'

import { createRpcCredentials } from '../renderer/zcash'
import config from './config'
import { spawnZcashNode } from './zcash/bootstrap'
import electronStore from '../shared/electronStore'

const osPathsBlockchainCustom = {
  darwin: `${process.env.HOME ||
    process.env.USERPROFILE}/Library/Application Support/ZbayData/`,
  linux: `${process.env.HOME || process.env.USERPROFILE}/ZbayData/`,
  win32: `${os.userInfo().homedir}\\AppData\\Roaming\\ZbayData\\`
}

const osPathsBlockchainDefault = {
  darwin: `${process.env.HOME ||
    process.env.USERPROFILE}/Library/Application Support/Zcash/`,
  linux: `${process.env.HOME || process.env.USERPROFILE}/.zcash/`,
  win32: `${os.userInfo().homedir}\\AppData\\Roaming\\Zcash\\`
}

const osPathsParams = {
  darwin: `${process.env.HOME ||
    process.env.USERPROFILE}/Library/Application Support/ZcashParams/`,
  linux: `${process.env.HOME || process.env.USERPROFILE}/.zcash-params/`,
  win32: `${os.userInfo().homedir}\\AppData\\Roaming\\ZcashParams\\`
}

const osPathLogs = {
  darwin: `${process.env.HOME ||
    process.env.USERPROFILE}/Library/Application Support/Zbay/Logs/`,
  linux: `${process.env.HOME || process.env.USERPROFILE}/.config/Zbay/Logs/`,
  win32: `${os.userInfo().homedir}\\AppData\\Roaming\\Zbay\\Logs\\`
}

let isFetchedFromExternalSource = false

const BLOCKCHAIN_SIZE = 27552539059
const isFetchingArr = []
let prevFetchedSize = 0

const calculateDownloadSpeed = (downloadedSize, source) => {
  const diff = downloadedSize - prevFetchedSize
  prevFetchedSize = downloadedSize
  const speedInSec = diff / 3
  const convertedSpeed = speedInSec ? Math.abs(speedInSec.toFixed()) : null
  const estimatedTimeForRescanning = 800
  let isFetching = false
  const eta = convertedSpeed
    ? convert(((parseInt(((BLOCKCHAIN_SIZE - downloadedSize) / convertedSpeed)) + estimatedTimeForRescanning)))
    : null
  if (isFetchingArr.length < 2) {
    isFetchingArr.push(convertedSpeed)
  } else {
    const [prevSpeedValue, currentSpeedValue] = isFetchingArr
    isFetching = prevSpeedValue !== currentSpeedValue
    isFetchingArr.shift()
    isFetchingArr.push(convertedSpeed)
  }
  if (mainWindow) {
    mainWindow.webContents.send('fetchingStatus', {
      sizeLeft: source === 'params' ? BLOCKCHAIN_SIZE : BLOCKCHAIN_SIZE - downloadedSize,
      speed: convertedSpeed,
      eta,
      isFetching: isFetching ? 'IN_PROGRESS' : 'INTERRUPTED'
    })
  }
}

let checkSizeInterval
let isWillQuitEventAdded = false

const downloadManagerForZippedBlockchain = ({ data, source }) => {
  const dataToFetch = R.clone(data)
  let downloadedFilesCounter = 0
  const targetCounter = source === 'params' ? 1 : process.platform === 'win32' ? 10 : 5
  const saveFileListToElectronStore = () => {
    if (downloadedFilesCounter >= targetCounter) {
      electronStore.set(`AppStatus.${source === 'params' ? 'params' : 'blockchain'}`, {
        status: config.PARAMS_STATUSES.FETCHING,
        filesToFetch: dataToFetch
      })
      downloadedFilesCounter = 0
    } else {
      downloadedFilesCounter++
    }
  }
  return new Promise(function (resolve, reject) {
    let downloadedSize = 0
    const checkFetchedSize = () => {
      getSize(source === 'params' ? osPathsParams[process.platform] : osPathsBlockchainCustom[process.platform],
        (err, size) => {
          if (err) {
            throw err
          }
          downloadedSize = size
          calculateDownloadSpeed(downloadedSize, source)
        })
    }
    checkSizeInterval = setInterval(() => {
      checkFetchedSize()
    }, 3000)
    if (!isWillQuitEventAdded) {
      app.on('will-quit', () => {
        clearInterval(checkSizeInterval)
        reject(console.log('app exited'))
      })
      isWillQuitEventAdded = true
    }
    const startFetching = (data) => {
      let item
      const gunzip = zlib.createGunzip()
      if (!data[0]) return
      const { fileName, targetUrl } = data[0]
      item = data.shift()
      const preparedFilePath = process.platform === 'win32' ? fileName.split('/').join('\\\\') : fileName
      const path = source === 'params' ? `${osPathsParams[process.platform]}${preparedFilePath}` : `${osPathsBlockchainCustom[process.platform]}${preparedFilePath}`
      const handleErrors = (err) => {
        console.log(err)
        data.push(item)
        if (mainWindow) {
          mainWindow.webContents.send('fetchingStatus', {
            isFetching: 'INTERRUPTED'
          })
        }
        setTimeout(() => startFetching(data), 10000)
      }
      progress(request(targetUrl, { timeout: 10000 }), {
        throttle: 500
      })
        .on('error', function (err) {
          handleErrors(err)
        })
        .pipe(gunzip)
        .on('end', () => {
          const indexToDelete = R.findIndex(R.propEq('fileName', fileName), dataToFetch)
          dataToFetch.splice(indexToDelete, 1)
          saveFileListToElectronStore()
          if (data.length !== 0) {
            setTimeout(() => startFetching(data), 0)
          } else {
            if (dataToFetch.length === 0) {
              if (source !== 'params') {
                mainWindow.webContents.send('fetchingStatus', {
                  part: 'blockchain',
                  status: config.BLOCKCHAIN_STATUSES.SUCCESS
                })
              }
              clearInterval(checkSizeInterval)
              resolve(console.log('Download Completed'))
            }
          }
        })
        .on('error', (err) => {
          handleErrors(err)
        })
        .pipe(fs.createWriteStream(path))
        .on('error', (err) => {
          handleErrors(err)
        })
    }
    if (source === 'params') {
      startFetching(data)
    } else {
      startFetching(data)
      startFetching(data)
      startFetching(data)
      startFetching(data)
    }
  })
}

const isTestnet = parseInt(process.env.ZBAY_IS_TESTNET)
let nodeProc = null

export const isDev = process.env.NODE_ENV === 'development'
const installExtensions = async () => {
  require('electron-debug')({
    showDevTools: true
  })

  const installer = require('electron-devtools-installer')
  const forceDownload = Boolean(process.env.UPGRADE_EXTENSIONS)
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']

  try {
    await Promise.all(
      extensions.map(ext => installer.default(installer[ext], forceDownload))
    )
  } catch (err) {
    console.error("Couldn't install devtools.")
  }
}

const windowSize = {
  width: 800,
  height: 540
}

var mainWindow
let running = false

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const url = new URL(commandLine[1])
    if (url.searchParams.has('invitation')) {
      mainWindow.webContents.send('newInvitation', {
        invitation: url.searchParams.get('invitation')
      })
    }
    if (url.searchParams.has('importchannel')) {
      mainWindow.webContents.send('newChannel', {
        channelParams: url.searchParams.get('importchannel')
      })
    }
  })
}
app.on('open-url', (event, url) => {
  event.preventDefault()
  const data = new URL(url)
  if (mainWindow) {
    if (data.searchParams.has('invitation')) {
      mainWindow.webContents.send('newInvitation', {
        invitation: data.searchParams.get('invitation')
      })
    }
    if (data.searchParams.has('importchannel')) {
      mainWindow.webContents.send('newChannel', {
        channelParams: data.searchParams.get('importchannel')
      })
    }
  }
})

let browserWidth
let browserHeight
const createWindow = () => {
  const windowUserSize = electronStore.get('windowSize')
  mainWindow = new BrowserWindow({
    width: windowUserSize ? windowUserSize.width : windowSize.width,
    height: windowUserSize ? windowUserSize.height : windowSize.height,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    },
    autoHideMenuBar: true
  })
  mainWindow.setMinimumSize(600, 400)
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
      hash: '/vault'
    })
  )

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize()
    browserHeight = height
    browserWidth = width
  })
}

let isUpdatedStatusCheckingStarted = false

const checkForUpdate = win => {
  if (!isUpdatedStatusCheckingStarted) {
    autoUpdater.checkForUpdates()
    autoUpdater.on('checking-for-update', () => {
      console.log('checking for updates...')
    })
    autoUpdater.on('error', error => {
      console.log(error)
    })
    autoUpdater.on('update-not-available', () => {
      console.log('event no update')
      electronStore.set('updateStatus', config.UPDATE_STATUSES.NO_UPDATE)
    })
    autoUpdater.on('update-available', info => {
      console.log(info)
      electronStore.set('updateStatus', config.UPDATE_STATUSES.PROCESSING_UPDATE)
    })

    autoUpdater.on('update-downloaded', info => {
      const blockchainStatus = electronStore.get('AppStatus.blockchain.status')
      const paramsStatus = electronStore.get('AppStatus.params.status')
      if (blockchainStatus !== config.BLOCKCHAIN_STATUSES.SUCCESS || paramsStatus !== config.PARAMS_STATUSES.SUCCESS) {
        autoUpdater.quitAndInstall()
      } else {
        win.webContents.send('newUpdateAvailable')
      }
    })
    isUpdatedStatusCheckingStarted = true
  }
  autoUpdater.checkForUpdates()
}

const checkPath = pathToCreate => {
  if (!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate)
  }
}

const fetchParams = async (win, torUrl) => {
  checkPath(osPathsParams[process.platform])

  const { filesToFetch } = electronStore.get(
    'AppStatus.params'
  )

  let downloadArray
  if (!filesToFetch) {
    const { data } = await axios({
      url: config.PARAMS_LINK,
      method: 'get'
    })
    downloadArray = data
  } else {
    downloadArray = filesToFetch
  }
  await downloadManagerForZippedBlockchain({ data: downloadArray, source: 'params' })

  electronStore.set('AppStatus.params', {
    status: config.PARAMS_STATUSES.SUCCESS,
    filesToFetch: []
  })
  win.webContents.send('bootstrappingNode', {
    message: 'Launching zcash node',
    bootstrapping: true
  })
  nodeProc = spawnZcashNode(process.platform, isTestnet, torUrl)
  mainWindow.webContents.send('bootstrappingNode', {
    message: '',
    bootstrapping: false
  })
  nodeProc.on('close', () => {
    nodeProc = null
  })
}

const fetchBlockchain = async (win, torUrl) => {
  const pathList = [
    `${osPathsBlockchainCustom[process.platform]}`,
    `${osPathsBlockchainCustom[process.platform]}${
      process.platform === 'win32' ? 'blocks\\' : 'blocks/'
    }`,
    `${osPathsBlockchainCustom[process.platform]}${
      process.platform === 'win32' ? 'blocks\\index\\' : 'blocks/index/'
    }`,
    `${osPathsBlockchainCustom[process.platform]}${
      process.platform === 'win32' ? 'chainstate\\' : 'chainstate/'
    }`
  ]

  const { status, filesToFetch } = electronStore.get(
    'AppStatus.blockchain'
  )

  let downloadArray
  if (!filesToFetch) {
    const { data } = await axios({
      url: config.BLOCKCHAIN_LINK,
      method: 'get'
    })
    downloadArray = data
  } else {
    downloadArray = filesToFetch
  }
  if (status === config.BLOCKCHAIN_STATUSES.TO_FETCH) {
    fs.emptyDirSync(osPathsBlockchainCustom[process.platform])
  }

  pathList.forEach(path => checkPath(path))
  await downloadManagerForZippedBlockchain({ data: downloadArray, source: 'blockchain' })
  electronStore.set('AppStatus.blockchain', {
    status: config.BLOCKCHAIN_STATUSES.SUCCESS,
    filesToFetch: []
  })
  win.webContents.send('bootstrappingNode', {
    message: 'Launching zcash node',
    bootstrapping: true
  })
  nodeProc = spawnZcashNode(process.platform, isTestnet, torUrl)
  mainWindow.webContents.send('bootstrappingNode', {
    message: '',
    bootstrapping: false
  })
  nodeProc.on('close', () => {
    nodeProc = null
  })
  app.on('will-quit', () => {
    const isRescanned = electronStore.get('AppStatus.blockchain.isRescanned')
    if (nodeProc && !isRescanned) {
      nodeProc.kill('SIGKILL')
    }
  })
}

let powerSleepId

const createZcashNode = async (win, torUrl) => {
  const updateStatus = electronStore.get('updateStatus')
  const blockchainConfiguration = electronStore.get('blockchainConfiguration')
  if (updateStatus !== config.UPDATE_STATUSES.NO_UPDATE || (blockchainConfiguration === config.BLOCKCHAIN_STATUSES.WAITING_FOR_USER_DECISION && isFetchedFromExternalSource)) {
    setTimeout(() => {
      createZcashNode(win, torUrl)
    }, 5000)
    return
  }
  let AppStatus = electronStore.get('AppStatus')
  const vaultStatus = electronStore.get('vaultStatus')
  if (!isDev && (!isFetchedFromExternalSource || blockchainConfiguration === config.BLOCKCHAIN_STATUSES.TO_FETCH)) {
    checkPath(osPathsBlockchainCustom[process.platform])
    powerSleepId = powerSaveBlocker.start('prevent-app-suspension')
    if (!AppStatus) {
      electronStore.set('AppStatus', {
        params: {
          status: config.PARAMS_STATUSES.FETCHING
        },
        blockchain: {
          status: config.BLOCKCHAIN_STATUSES.TO_FETCH,
          isRescanned: false
        },
        fetchedSize: 0
      })
      await fetchParams(win, torUrl)
    }
    const { status: paramsStatus } = electronStore.get('AppStatus.params')
    const { status: blockchainStatus } = electronStore.get(
      'AppStatus.blockchain'
    )
    if (
      paramsStatus !== config.PARAMS_STATUSES.SUCCESS
    ) {
      await fetchParams(win, torUrl)
    }
    if (
      blockchainStatus !== config.PARAMS_STATUSES.SUCCESS &&
      vaultStatus === config.VAULT_STATUSES.CREATED
    ) {
      await fetchBlockchain(win, torUrl)
    } else {
      if (vaultStatus) {
        nodeProc = spawnZcashNode(process.platform, isTestnet, torUrl)
        mainWindow.webContents.send('bootstrappingNode', {
          message: '',
          bootstrapping: false
        })
        nodeProc.on('close', () => {
          console.log('closing connection')
          nodeProc = null
        })
        app.on('will-quit', () => {
          const isRescanned = electronStore.get('AppStatus.blockchain.isRescanned')
          if (nodeProc && !isRescanned) {
            nodeProc.kill('SIGKILL')
          }
        })
      }
    }
  } else {
    nodeProc = spawnZcashNode(process.platform, isTestnet, torUrl)
    mainWindow.webContents.send('bootstrappingNode', {
      message: '',
      bootstrapping: false
    })
    nodeProc.on('close', () => {
      console.log('closing connection')
      nodeProc = null
    })
    app.on('will-quit', () => {
      const isRescanned = electronStore.get('AppStatus.blockchain.isRescanned')
      if (nodeProc && !isRescanned) {
        nodeProc.kill('SIGKILL')
      }
    })
  }
}

app.on('ready', async () => {
  const blockchainStatus = electronStore.get('AppStatus.blockchain.status')
  const isBlockchainExists = fs.existsSync(`${osPathsBlockchainDefault[process.platform]}`)
  const isCustomPathExists = fs.existsSync(`${osPathsBlockchainCustom[process.platform]}`)
  isFetchedFromExternalSource = isBlockchainExists && !blockchainStatus
  electronStore.set('isBlockchainFromExternalSource', isFetchedFromExternalSource)
  const blockchainConfiguration = electronStore.get('blockchainConfiguration')
  const paramsStatus = electronStore.get('AppStatus.blockchain.status')
  const isOldUser = paramsStatus === config.PARAMS_STATUSES.SUCCESS && blockchainStatus === config.BLOCKCHAIN_STATUSES.SUCCESS
  if (!blockchainConfiguration) {
    if (isOldUser) {
      electronStore.set('blockchainConfiguration', config.BLOCKCHAIN_STATUSES.DEFAULT_LOCATION_SELECTED)
    } else if (isFetchedFromExternalSource) {
      electronStore.set('blockchainConfiguration', config.BLOCKCHAIN_STATUSES.WAITING_FOR_USER_DECISION)
    } else if (!isCustomPathExists && blockchainStatus === config.BLOCKCHAIN_STATUSES.FETCHING) {
      electronStore.set('AppStatus.blockchain', {
        status: config.BLOCKCHAIN_STATUSES.TO_FETCH,
        isRescanned: false
      })
      electronStore.set('blockchainConfiguration', config.BLOCKCHAIN_STATUSES.TO_FETCH)
    } else {
      electronStore.set('blockchainConfiguration', config.BLOCKCHAIN_STATUSES.TO_FETCH)
    }
  }
  const template = [
    {
      label: 'Zbay',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ]
  // app.on(`browser-window-created`, (e, window) => {
  //   mainWindow.setMenu(null)
  // })
  if (process.platform === 'darwin') {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }
  globalShortcut.register('F11', () => {
    mainWindow.webContents.send('toggleCoordinator', {})
  })
  globalShortcut.register('CommandOrControl+L', () => {
    mainWindow.webContents.send('openLogs')
  })

  await installExtensions()

  createWindow()
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('ping')
    const osPaths = {
      darwin: `${process.env.HOME ||
        process.env.USERPROFILE}/Library/Application Support/ZbayData`,
      linux: `${process.env.HOME || process.env.USERPROFILE}/ZbayData`,
      win32: `${os.userInfo().homedir}\\AppData\\Roaming\\ZbayData`
    }

    const BLOCKCHAIN_SIZE = 27843545600
    const REQUIRED_FREE_SPACE = 1073741824
    const ZCASH_PARAMS = 1825361100

    if ((!blockchainConfiguration || blockchainConfiguration === config.BLOCKCHAIN_STATUSES.WAITING_FOR_USER_DECISION) && isFetchedFromExternalSource) {
      if (mainWindow) {
        mainWindow.webContents.send('askForUsingDefaultBlockchainLocation')
      }
    }
    if (!fs.existsSync(osPaths[process.platform])) {
      fs.mkdirSync(osPaths[process.platform])
    }
    getSize(osPaths[process.platform], (err, downloadedSize) => {
      if (err) {
        throw err
      }
      checkDiskSpace('/').then(diskspace => {
        const blockchainSizeLeftToFetch = BLOCKCHAIN_SIZE - downloadedSize
        const freeSpaceLeft =
              diskspace.free -
              (blockchainSizeLeftToFetch + ZCASH_PARAMS + REQUIRED_FREE_SPACE)
        if (freeSpaceLeft <= 0) {
          if (mainWindow) {
            mainWindow.webContents.send(
              'checkDiskSpace',
              `Sorry, but Zbay needs ${(
                blockchainSizeLeftToFetch /
                    1024 ** 3
              ).toFixed(2)} GB to connect to its network and you only have ${(
                diskspace.free /
                    1024 ** 3
              ).toFixed(2)} free.`
            )
          }
        }
      })
    })

    if (!isDev) {
      checkForUpdate(mainWindow)
      setInterval(() => {
        checkForUpdate(mainWindow)
      }, 15 * 60000)
    }
  })

  ipcMain.on('proceed-update', (event, arg) => {
    autoUpdater.quitAndInstall()
  })

  let rescanningInterval
  let tick = 0
  const progressBlocksArr = []

  ipcMain.on('toggle-rescanning-progress-monitor', (event, arg) => {
    if (!rescanningInterval) {
      rescanningInterval = setInterval(() => {
        findInFiles.find('rescanning', `${osPathsBlockchainCustom[process.platform]}`, 'debug.log$')
          .then(function (results) {
            if (tick > 1) {
              const rescannedBlock = results[`${osPathsBlockchainCustom[process.platform]}debug.log`].line.slice(-1)[0].substr(-25, 7).trim().replace('.', '')
              if (mainWindow) {
                mainWindow.webContents.send('fetchingStatus', {
                  rescannedBlock
                })
              }
              const rescannedBlockInt = parseInt(rescannedBlock)
              if (progressBlocksArr.length < 2) {
                progressBlocksArr.push(rescannedBlockInt)
              } else {
                const diff = progressBlocksArr[1] - progressBlocksArr[0]
                const timeInterval = 70
                const blockToRescan = 722000 - rescannedBlockInt
                const remainingTime = timeInterval * blockToRescan / diff
                const eta = convert(remainingTime.toFixed())
                if (mainWindow) {
                  mainWindow.webContents.send('fetchingStatus', {
                    rescannedBlock,
                    eta
                  })
                }
                progressBlocksArr.shift()
                progressBlocksArr.push(rescannedBlockInt)
              }
            }
          })
        tick++
      }, 70000)
    } else {
      console.log('clear interval')
      clearInterval(rescanningInterval)
    }
  })

  ipcMain.on('vault-created', (event, arg) => {
    electronStore.set('vaultStatus', config.VAULT_STATUSES.CREATED)
    const blockchainConfiguration = electronStore.get('blockchainConfiguration')
    if (!isDev && (!isFetchedFromExternalSource || blockchainConfiguration === config.BLOCKCHAIN_STATUSES.TO_FETCH)) {
      const { status } = electronStore.get('AppStatus.blockchain')
      if (status !== config.BLOCKCHAIN_STATUSES.SUCCESS) {
        nodeProc.on('close', code => {
          setTimeout(() => {
            createZcashNode(mainWindow)
          }, 1000)
        })
        nodeProc.kill()
      }
    }
  })

  ipcMain.on('proceed-with-syncing', (event, userChoice) => {
    if (userChoice === 'EXISTING') {
      electronStore.set('blockchainConfiguration', config.BLOCKCHAIN_STATUSES.DEFAULT_LOCATION_SELECTED)
    } else {
      electronStore.set('blockchainConfiguration', config.BLOCKCHAIN_STATUSES.TO_FETCH)
    }
  })

  let loadLogsInterval
  const checkLogsFiles = () => {
    const blockchainConfiguration = electronStore.get('blockchainConfiguration')
    const targetPath = {
      transactions: `${osPathLogs[process.platform]}transactions.json`,
      debug: blockchainConfiguration === config.BLOCKCHAIN_STATUSES.TO_FETCH ? `${osPathsBlockchainCustom[process.platform]}debug.log`
        : `${osPathsBlockchainDefault[process.platform]}debug.log`,
      rpcCalls: `${osPathLogs[process.platform]}rpcCalls.json`
    }
    const isTransactionFileExists = fs.existsSync(targetPath.transactions)
    const isRpcCallsFileExists = fs.existsSync(targetPath.rpcCalls)
    const createJsonFormatFile = (path) => fs.writeFileSync(path, JSON.stringify([]))
    if (!isTransactionFileExists) {
      createJsonFormatFile(targetPath.transactions)
    }
    if (!isRpcCallsFileExists) {
      createJsonFormatFile(targetPath.rpcCalls)
    }
  }

  const loadLogs = async () => {
    const blockchainConfiguration = electronStore.get('blockchainConfiguration')
    const targetPath = {
      transactions: `${osPathLogs[process.platform]}transactions.json`,
      debug: blockchainConfiguration === config.BLOCKCHAIN_STATUSES.TO_FETCH ? `${osPathsBlockchainCustom[process.platform]}debug.log`
        : `${osPathsBlockchainDefault[process.platform]}debug.log`,
      rpcCalls: `${osPathLogs[process.platform]}rpcCalls.json`
    }
    checkPath(osPathLogs[process.platform])
    checkLogsFiles()
    const transactions = JSON.parse(fs.readFileSync(targetPath.transactions))
    const applicationLogs = JSON.parse(fs.readFileSync(targetPath.rpcCalls))
    const debugFileLines = await readLastLines.read(targetPath.debug, 100)
    if (mainWindow) {
      mainWindow.webContents.send('load-logs-to-store', {
        debug: debugFileLines.split('\n'),
        transactions,
        applicationLogs
      })
    }
  }

  ipcMain.on('load-logs', (event, type) => {
    if (!loadLogsInterval) {
      loadLogs()
      loadLogsInterval = setInterval(async () => {
        loadLogs()
      }, 15000)
    }
  })

  ipcMain.on('disable-load-logs', (event) => {
    if (loadLogsInterval) {
      clearInterval(loadLogsInterval)
      loadLogsInterval = null
    }
  })

  ipcMain.on('save-to-log-file', (event, { type, payload }) => {
    checkPath(osPathLogs[process.platform])
    checkLogsFiles()
    const blockchainConfiguration = electronStore.get('blockchainConfiguration')
    const targetPath = {
      transactions: `${osPathLogs[process.platform]}transactions.json`,
      debug: blockchainConfiguration === config.BLOCKCHAIN_STATUSES.TO_FETCH ? `${osPathsBlockchainCustom[process.platform]}debug.log`
        : `${osPathsBlockchainDefault[process.platform]}debug.log`,
      rpcCalls: `${osPathLogs[process.platform]}rpcCalls.json`
    }
    if (type === 'TRANSACTION') {
      const transactions = JSON.parse(fs.readFileSync(targetPath.transactions))
      transactions.push(payload)
      fs.writeFileSync(targetPath.transactions, JSON.stringify(transactions))
    } else {
      const applicationLogs = JSON.parse(fs.readFileSync(targetPath.rpcCalls))
      applicationLogs.push(payload)
      fs.writeFileSync(targetPath.rpcCalls, JSON.stringify(applicationLogs))
    }
  })

  ipcMain.on('disable-sleep-prevention', (event, arg) => {
    if (powerSleepId) {
      powerSaveBlocker.stop(powerSleepId)
    }
  })

  ipcMain.on('create-node', async (event, arg) => {
    let torUrl
    if (arg) {
      torUrl = arg.toString()
    }
    if (!running) {
      running = true
      if (!isDev) {
        if (!electronStore.get('username')) {
          await createRpcCredentials()
        }
        createZcashNode(mainWindow, torUrl)
      }
    }
  })
})

app.setAsDefaultProtocolClient('zbay')

process.on('exit', () => {
  if (nodeProc !== null) {
    nodeProc.kill()
  }
})

app.on('before-quit', () => {
  if (browserWidth && browserHeight) {
    electronStore.set('windowSize', { width: browserWidth, height: browserHeight })
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  const vaultStatus = electronStore.get('vaultStatus')
  const shouldFullyClose = isFetchedFromExternalSource || vaultStatus !== config.VAULT_STATUSES.CREATED
  if (process.platform !== 'darwin' || shouldFullyClose) {
    app.quit()
  }
})
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
