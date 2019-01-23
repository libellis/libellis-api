# Libellis API
[![Build Status](https://travis-ci.org/libellis/libellis-backend.svg?branch=master)](https://travis-ci.org/libellis/libellis-backend)
[![Coverage Status](https://coveralls.io/repos/github/libellis/libellis-backend/badge.svg?branch=master)](https://coveralls.io/github/libellis/libellis-backend?branch=master)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A RESTful API for a modern voting application that allows users to create and vote on ranked polls.

[APIary Docs for Understanding Routes](https://libellis.docs.apiary.io)

## Introduction
Libellis is a ranked voting application with a simple API for users to create, share, and vote on surveys, where each survey question would effictively be a poll.

## Setup

We have currently only tested Libellis on unix-like systems (Linux, OSX, FreeBSD). If you are using Windows you will (for now) need to figure out setup yourself. There are a few things we need to setup to run libellis locally. Libellis relies
on `postgres`.  If you don't have `postgres` installed we will do that now -
otherwise skip to the [next](#building-libellis-db-with-birdseed) section.

### Postgres Installation

Postgres can be installed on a variety of operating systems. We will cover Linux
and OSX in this guide.

### Linux Postgres Install

Install the `postgresql` package for your linux distro. I will cover arch linux
in this guide:

```terminal
$ sudo pacman -S postgresql
```

Once we have installed PostgreSQL we will need to switch to the PostgreSQL user:

```terminal
$ sudo -iu postgres
```

We will now initialize the database cluster:

```terminal
[postgres]$ initdb -D /var/lib/postgres/data
```

Now that we've inintialized the cluster we must **start** and **enable** the
`postgresql.service`:

```terminal
$ systemctl enable postgresql.service
$ systemctl start postgresql.service
```

Lastly we will create our first database user:

```terminal
[postgres]$ createuser --interactive
```

Now that we've covered how to get `PostgreSQL` setup on linux, let's see how we
can set it up on Mac OSX.

### OSX Postgres Install

Make sure you have homebrew installed.  If not you can install homebrew with
this terminal command:

```terminal
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Now we just install postgres using homebrew and enable it as a service:

```terminal
$ brew install postgresql
$ brew services start postgresql
```

That's it! Now we can create our Libellis database. There's an easy and a harder
way to create the Libellis database. Let's go the easy path first

## Building Libellis DB with Birdseed

We can very easily build both our primary and test database using the
[birdseed](https://github.com/libellis/birdseed) terminal application. Once
you've installed birdseed simply type:

```terminal
$ birdseed setup 
```

This will setup both the libellis and libellis_test databases and setup all
tables using up-to-date migration files that are embedded in the birdseed
binary.

If you ever need to rebuild your databases just run:

```terminal
$ birdseed rebuild -a
```

The nice thing about this method is that birdseed will always stay up to date
and we can update our libellis database (should the schema change, or more
tables get added in the future) by running:

```terminal
$ birdseed migrate
```

Now that we've looked at doing it the easy way, let's try the harder way.

## Building Libellis DB manually

Since we have `PostgreSQL` configured (if you didn't do this then scroll up and
complete this step first) we can manually create our libellis primary and test
database and build up their columns per the current spec.  Let's first create
both the primary and test databases:

```terminal
$ createdb libellis
$ createdb libellis_test
```

Now we will seed both.  We will have to first clone the project:

```terminal
$ git clone https://github.com/libellis/libellis-backend.git
$ cd libellis-backend
$ psql libellis < data.sql
$ psql libellis_test < data.sql
```

While this method may seem easier, the downside is that by doing it this way we
do not have a migrations table, which means we can't use birdseed to easily
handle our migrations.

Now that we've gotten the database setup out of the way, let's go ahead and
install the necessary `npm` modules and get the server up and running.

## Installation

If you don't have npm installed, then you can follow [this
guide](https://www.npmjs.com/get-npm) to get it 
installed on your system.

Let's cd into the project. If you used birdseed to setup your databases then you
may not have cloned the repo yet:

```terminal
$ git clone https://github.com/libellis/libellis-backend.git
$ cd libellis-backend
$ npm install
```

Now we start our server by using `npm start`:

```terminal
$ npm start
```

If you would like your server to automatically restart when you are saving
changes (you are a contributor) then you can use nodemon instead:

```terminal
$ nodemon server.js
```

Now we have a running Libellis backend! To understand how all the routes work,
read our [APIary docs](https://libellis.docs.apiary.io).

Let's lastly look at how we can run comprehensive unit and integration tests
that come bundled with the libellis backend.

## Tests

To run tests we use the `jest` framework.  Because our tests will setup the test
database with dummy data and then run a series of tests that tear down and setup
that database between testing, we need to run our tests in **serial** by using
the `-i` flag:

```
$ jest -i
```

To get a full coverage report we can run:

```
$ jest -i --coverage
```

That's it for tests! If you are contributing a new feature set please add unit
and integration tests under the appropriate folders within the `__tests__` folder.

Enjoy using Libellis!
