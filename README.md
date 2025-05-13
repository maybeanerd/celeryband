# CeleryBand

CeleryBand is an open source platform that brings transparency to workplace compensation at your organization. Share and compare salaries anonymously within your organization to understand your market value and advocate for fair pay.

It is built to be selfhosted by anyone, but you can also reach out if you e.g. don't have people skilled in hosting software within your group or company.
We might be able to add a new instance for you on the *.celery.band domain.

There's a public, official test instance for you to try it out on https://test.celery.band/ which allows signups from gmail address.

# Features

## Get an intuitive overview of your compensation compared to other employees across your entire organisation, or scoped to your role and department.


## Truly anonymous
When signing up, your email is securely hashed and stored in a way that nobody can (reasonably) link your account to your email.

Statistics are only provided when their aggregate consists of at least 3 distinct datapoints, which ensures only aggregate data can be seen by end users.

![image](https://github.com/user-attachments/assets/263dc054-fcc9-44ed-bbc4-32024b3522e9)

## Customizable

You can configure what seniority levels, roles and departments are available to users.

![image](https://github.com/user-attachments/assets/2b212b4f-2743-41db-ab70-e181ef4f9866)


# Development

## Setup

Make sure to install the dependencies:

```bash
nvm i
corepack enable pnpm
pnpm i
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm  build
```

Locally preview production build:

```bash
pnpm  preview

```
