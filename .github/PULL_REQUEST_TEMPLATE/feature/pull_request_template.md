## Notion Ticket

Please replace this text with a link to the relevant Notion ticket

## Description

Description should include:

- High level description of your approach
- List out things outside the norm that the reviewer should be aware of
- Annotate the files with a GitHub comment if you need to point out a specific oddity or question 

## Screenshots or Video

We use either screenshots or video to capture changes. Caveats:

- If api/graphql only, we capture it from the terminal or Hasura console
- Please add some captions to the PR

## Submitter Checklist

- Service: `api-server`
	- [ ] No errors running `make mypy`
	- [ ] No errors running `make mypy-tests`
	- [ ] No errors running `make run-test-local`
	- [ ] Follow style guide
	- [ ] Adds Python unit test(s) as appropriate
- Service: `app` service
	- [ ] No unused imports or other warnings
	- [ ] Ran `yarn prettier-write` 
	- [ ] Follows style guide
	- [ ] Adds Cypress test(s) as appropriate
	- [ ] Adds Jest unit test(s) as appropriate
	- [ ] GraphQL queries use `id` and fragments, as appropriate
	- [ ] GraphQL fragments live in either `customer_fragments.graphql`, `bank_fragments.graphql`, or `fragments.graphql` - depending on permissions intention 
- Service: `graph-ql` service
	- [ ] Database changes in a separate PR that follows the checklist in the database PR template
- General
	- [ ] PR only includes code changes relevant to ticket (unrelated cleanup should be separate)
		- [ ] If an exception is needed, it was raised up in #eng-general beforehand in Slack
	- [ ] Attached screenshots with captions
	- [ ] Moved Notion ticket to `In Review` column
	- [ ] PR addresses all items in ticket's success criteria
		- [ ] If breaking ticket into multiple PRs (often advisable), PR describes this
	- [ ] Pull request title is descriptive
	- [ ] Tag the appropriate person for review (usually the platform lead)
	- [ ] Resolved feedback commits as they are committed and pushed
	- [ ] File names follow existing conventions
	- [ ] Check to make sure you don't have any uncommitted files sitting in your local
	- [ ] If PR needs other PRs to be complete before this one should be deployed, alert the tech team

## Reviewer Checklist

- Service: `api-server`
	- [ ] Follows style guide
	- [ ] Unit tests make sense
- Service: `app` service
	- [ ] Follows style guide
	- [ ] Cypress unit tests make sense
	- [ ] Jest unit tests make sense
	- [ ] Graphql functions follow existing convetions
- General
	- [ ] File names follow existing convention
	- [ ] Pull branch and test locally
	- [ ] Submitter has addressed all requested feedback
	- [ ] Move Notion ticket to `To Deploy` once merged
