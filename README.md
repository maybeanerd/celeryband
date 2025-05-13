# CeleryBand

CeleryBand is an open source platform that brings transparency to workplace compensation at your organization. Share and compare salaries anonymously within your organization to understand your market value and advocate for fair pay.

It is built to be selfhosted by anyone, but you can also reach out if you e.g. don't have people skilled in hosting software within your group or company.
We might be able to add a new instance for you on the *.celery.band domain hosted in Germany.

There's a public, official test instance for you to try it out on https://test.celery.band/ which allows signups from gmail addresses.

# Features

## Salary Band Visualisations

Get an intuitive overview of your compensation compared to other employees across your entire organisation, or scoped to your role and department.

![Screenshot 2025-05-13 at 20 50 11](https://github.com/user-attachments/assets/a7e7c73b-9b7a-4016-a2a8-f1ef988f3875)

The bands are scaled to be relative to eachother, which helps compare a role across multiple seniority levels and see what future potential one has.

![Screenshot 2025-05-13 at 20 49 52](https://github.com/user-attachments/assets/dd50f226-feb6-4b41-a6b6-346cc7bd04e3)

## Time Model Normalization

You can choose to view statistics normalized to the hours per week you yourself work, or in absoluet numbers. This helps to give perspective and put things into context better.

![image](https://github.com/user-attachments/assets/8d13883b-6e1a-4da2-b957-7ad14c3271c4)


## Truly Anonymous
When signing up, your email is securely hashed and stored in a way that nobody can (reasonably) link your account to your identity.

Statistics are only provided when their aggregate consists of at least 3 distinct datapoints, which ensures only aggregate data can be seen by end users.

![image](https://github.com/user-attachments/assets/4f7c7fe2-97c4-46b9-ac20-4a78bfac343c)


## Own your data
You can update, change, or delete all your data at any point in time. As long as you have control of your campany email, you have full control over the account. No data is kept after you delete your account, and statistics will not include you salary anymore.

![image](https://github.com/user-attachments/assets/dad6c858-8757-4708-9bd2-6a02290575e9)


## Customizable

You (as the provide of the platform) can configure what seniority levels, roles and departments are available to users. The currency symbol is also fully customizable, as the statistics don't care about conversion - all salaries share the same currency.

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
