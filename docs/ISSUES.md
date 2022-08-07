# Issue Management

This page describes the issue management process of [bigER](https://github.com/borkdominik/bigER). 

See currently [open](https://github.com/borkdominik/bigER/issues) and [closed](https://github.com/borkdominik/bigER/issues?q=is%3Aissue+is%3Aclosed) issues of the project.

<!-- TABLE OF CONTENTS -->
<details>
  <summary><strong>Table of Contents</strong></summary>
  <ol>
    <li><a href="#status-workflow">Status Workflow</a></li>
    <li><a href="#types-of-issues">Types of Issues</a></li>
    <li><a href="#milestones">Milestones</a></li>
  </ol>
</details>
<br>


<!-- STATUS WORKFLOW -->
## Status Workflow

All open issues receive a label to indicate the current **status**. The status label can have the following values:
- `Open` 
- `In Progress`
- `Review`
- `Done`

The image below illustrates how issues transition between the different states, a description of the image is found below.

<br>

![Issue Workflow](../docs/img/issue-workflow.png)

<br>

Newly created issues are in a `Pending` state and remain unlabeled until verified and labeled by a code owner. Valid issues transition to `Open` and are ready to be worked on. Otheriwse, if invalid (see [Types of Issues](#type-of-issues) for possible reasons), the issue gets closed.

Open issues are set to `In Progress` when started by a developer. If the developer decides to stop working on the issue it becomes open again. By submitting a Pull Request (PR) the issue is ready for review with the `Review` status label. 

Again, a code owner reviews the PR and decides whether the submitted changes solve the issue. If the review is *OK*, the issue receives the `Done` status label and can be closed, otherwise, when *NOT OK* it goes back to `Open`.


<!-- TYPES OF ISSUES -->
## Types of Issues

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


<!-- MILESTONES -->
## Milestones

Milestones are created for new releases and are used for tracking which version fixes an issue. In case no milestone is set, fixes regarding the issue are not considered to be included in the next release.

See the [current list of milestones](https://github.com/borkdominik/bigER/milestones).


