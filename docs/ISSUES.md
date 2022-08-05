# Issue Management

This page describes the issue management process of [bigER](https://github.com/borkdominik/bigER). 

**Table of Contents**
1. [Status Workflow](#status-workflow)
2. [Type of Issues](#type-of-issues)
3. [Milestones](#milestones)

See all currently [open](https://github.com/borkdominik/bigER/issues) and [closed](https://github.com/borkdominik/bigER/issues?q=is%3Aissue+is%3Aclosed) issues of the project.

## Status Workflow

All open issues receive a label to indicate the current **status**. The status label can have following values:
- `Pending`
- `Open` 
- `In Progress`
- `Review`
- `Done`

The image below illustrates how issues transition between the different states, a description of the image is found below.

![Issue Workflow](../docs/img/issue-workflow.png)

Newly created issues are in a `Pending` state and require to be verified and labeled by a code owner. If the issue turns out the be invalid (see [Types of Issues](#type-of-issues) for possible reasons) it is closed. Otherwise, valid issues transition to the `Open` state. 

Open issues are ready to be worked on by a developer and when started it is set to `In Progress`. If the developer decides to stop working on the issue it becomes open again. By submitting a Pull Request (PR) the issue is ready for review with the `Review` status. 

Again, a code owner reviews the submitted PR and decides whether the issue is *NOT OK* and set back to `Open`, or it is *OK*, and in this case receives the status `Done` and can be closed.



## Type of Issues

Besides the status label, issues are also classified based on their **type**. Currently we use the following labels for classification:
- `bug` - Problems related to bugs
- `discussion` - Discussion or question
- `dev` - Improvements to the development experience
- `docs` - Improvements or additions to documentation
- `duplicate` - Duplicate of an existing issue
- `feature` - Request new changes
- `help` - Support needed
- `needs more info` - Missing information to be valid
- `won't do` - Currently cosidered out of scope and will not be worked on


## Milestones

Milestones are created for new releases and are used for tracking which version fixes an issue. In case no milestone is set, fixes regarding the issue are not considered to be included in the next release.

See the [current list of milestones](https://github.com/borkdominik/bigER/milestones).


