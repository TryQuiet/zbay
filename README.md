# Zbay

  

Zbay is an experimental app for Windows, Mac, and GNU/Linux that builds an IRC-like community & marketplace on the [Zcash](https://z.cash) network. For more on the values behind the project, read [this essay](https://zbay.app/#why).

# [Zbay Lite](https://github.com/ZbayApp/ZbayLite)
Zbay migrated to new version that uses a zcash light client. The full node version of Zbay is now deprecated. Find out more [here](https://github.com/ZbayApp/ZbayLite).



# Workflow for developers and QA

  1.  Issue created
  2.  Issue added to backlog if developers committed to working on it soon.
  3.  Issue dragged to correct place in backlog according to priority.
  4.  Devs pick the top unclaimed issue from backlog, unless there’s some other decision about who should work on what.
  5.  Devs use "done" label when done.
  6.  QA verifies that they’ve been done. 
  
      6a) If verification fails - qa removes "done" label and adds comment, notifying dev directly (personally or in slack). 
  
      6b) If verification succeeds - qa closes issue and moves it to the milestone.
      
     Note:  Milestone is created by QA and based on zBay version number. Version number is provided to QA by developer.
