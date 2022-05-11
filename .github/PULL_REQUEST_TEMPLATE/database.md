## Notion Ticket

Link to the Notion ticket that inspired the database changes

## Description

Please tell us the use case for making these database changes

## Submitter Checklist

- [ ] Apply migrations from master branch
- [ ] Apply metadata from master branch
- [ ] New columns have appropriate permissions set
- [ ] Correctly backed out any Hasura changes made in error
- [ ] Check to make sure `down.sql` and `up.sql` are auto-generated correctly
- [ ] timestamp columns follow the naming convention of `something_at`
- [ ] date columns follow the naming convention of `something_date`
- [ ] Table has the following columns
	- [ ] id (UUID)
	- [ ] created_at (timestamp with time zone, default: now())
	- [ ] updated_at (timestamp with time zone, default: now())
	- [ ] deleted_at (timestamp with time zone, default: now())
	- [ ] IF NEEDED: metadata_info (JSON, **not** JSONB)