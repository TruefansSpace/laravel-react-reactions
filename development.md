# Development Guide - Laravel React Reactions Package

This guide covers how to develop, test, and run the Laravel React Reactions package.

## Prerequisites

- PHP 8.4 or higher
- Composer
- Node.js and npm
- Laravel 11.0+ or 12.0+
- Playwright browsers (for E2E tests)

## Initial Setup

Navigate to the package directory:

```bash
cd packages/truefans/laravel-react-reactions
```

Install dependencies:

```bash
composer install
npm install
```

## Running the Development Server

The package uses Laravel Testbench Workbench for isolated development and testing.

### Build and Serve

```bash
composer serve
```

This command will:
1. Build the workbench environment
2. Start the development server at **http://127.0.0.1:8000**

### Manual Steps

If you prefer to run steps separately:

```bash
# Build workbench
php vendor/bin/testbench workbench:build

# Serve the application
php vendor/bin/testbench serve
```

### Setup Database

Run migrations in the workbench:

```bash
php vendor/bin/testbench migrate:fresh --seed
```

## Frontend Development

### Build Assets

```bash
npm run build
```

### Watch Mode (Hot Reload)

```bash
npm run dev
```

Then in another terminal, run the server:

```bash
composer serve
```

## Viewing Changes in Browser

1. Start the development server: `composer serve`
2. Start Vite dev server (optional, for hot reload): `npm run dev`
3. Open your browser to **http://127.0.0.1:8000**
4. Navigate to the workbench routes to test the reactions component
5. Changes to React components in `resources/js/` will hot-reload automatically
6. Changes to PHP files will require a browser refresh

## Running Tests

### Pest PHP Tests

**Run all PHP tests:**

```bash
composer test
```

Or directly:

```bash
vendor/bin/pest
```

**Run with coverage:**

```bash
composer test-coverage
```

**Run specific test suites:**

```bash
# Unit tests only
vendor/bin/pest tests/Unit

# Feature tests only
vendor/bin/pest tests/Feature

# Architecture tests only
vendor/bin/pest tests/ArchTest.php
```

**Run specific test file:**

```bash
vendor/bin/pest tests/Unit/HasReactionsTest.php
```

**Run specific test by name:**

```bash
vendor/bin/pest --filter="can add reaction to model"
```

**Watch mode (re-run on changes):**

```bash
vendor/bin/pest --watch
```

**Verbose output:**

```bash
vendor/bin/pest --verbose
```

### E2E Tests with Playwright

**Install Playwright browsers (first time only):**

```bash
npx playwright install
```

**Run E2E tests:**

```bash
npm run test:e2e
```

**Run with UI mode (interactive):**

```bash
npm run test:e2e:ui
```

**Run in headed mode (see browser):**

```bash
npm run test:e2e:headed
```

**Before running E2E tests, ensure:**

1. Assets are built: `npm run build`
2. Server is running: `composer serve` (in another terminal)
3. Database is migrated: `php vendor/bin/testbench migrate:fresh --seed`

### Run All Tests (PHP + E2E)

```bash
# Terminal 1: Start server
composer serve

# Terminal 2: Build assets and run all tests
npm run build
composer test
npm run test:e2e
```

## Code Quality

### Linting and Formatting

**Format PHP code with Pint:**

```bash
composer format
```

**Run PHPStan analysis:**

```bash
composer analyse
```

**Run both linting and analysis:**

```bash
composer lint
```

## Workbench Commands

The package uses Orchestra Testbench for isolated testing:

```bash
# Discover packages
php vendor/bin/testbench package:discover

# Clear package cache
php vendor/bin/testbench package:purge-skeleton

# Run artisan commands in workbench
php vendor/bin/testbench migrate
php vendor/bin/testbench db:seed
php vendor/bin/testbench route:list
php vendor/bin/testbench tinker
```

## Project Structure

```
packages/truefans/laravel-react-reactions/
├── src/                          # Package source code
│   ├── Traits/                   # HasReactions trait
│   ├── Models/                   # Reaction model
│   └── Http/Controllers/         # API controllers
├── resources/js/                 # React components (publishable)
│   └── Components/Reactions/     # Reaction picker component
├── tests/
│   ├── Unit/                     # Unit tests
│   ├── Feature/                  # Feature tests
│   ├── Browser/                  # Playwright E2E tests
│   └── ArchTest.php              # Architecture tests
├── workbench/                    # Testbench environment
│   ├── app/                      # Test application
│   ├── database/                 # Test migrations/seeders
│   └── resources/                # Test frontend assets
├── config/                       # Package configuration
├── database/migrations/          # Package migrations
└── routes/                       # Package routes
```

## Testing Your Changes

### Test in Workbench

1. Make changes to package code
2. Build assets: `npm run build`
3. Serve workbench: `composer serve`
4. Test in browser at http://127.0.0.1:8000

### Test in Parent Application

From the parent Laravel application root:

```bash
# The package is already linked via composer.json
composer install

# Publish assets
php artisan vendor:publish --tag=react-reactions-components

# Run migrations
php artisan migrate

# Use the package in your application
```

## Debugging

### Enable Verbose Logging

In workbench `.env`:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Clear Caches

```bash
php vendor/bin/testbench config:clear
php vendor/bin/testbench cache:clear
php vendor/bin/testbench view:clear
```

### Playwright Debugging

```bash
# Run with debug mode
PWDEBUG=1 npm run test:e2e

# Generate test code
npx playwright codegen http://127.0.0.1:8000
```

## Publishing Changes

Before publishing:

1. Run all tests: `composer test && npm run test:e2e`
2. Format code: `composer lint`
3. Update CHANGELOG.md
4. Update version in package.json
5. Commit and tag release

## Common Issues

### Port Already in Use

```bash
php vendor/bin/testbench serve --port=8001
```

### Playwright Tests Failing

Ensure server is running and assets are built:

```bash
npm run build
composer serve
# In another terminal:
npm run test:e2e
```

### Database Issues

Reset workbench database:

```bash
php vendor/bin/testbench migrate:fresh --seed
```

### Vite Build Issues

Clear node modules and rebuild:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Additional Resources

- [Laravel Package Development](https://laravel.com/docs/packages)
- [Orchestra Testbench](https://packages.tools/testbench)
- [Pest PHP Documentation](https://pestphp.com)
- [Playwright Documentation](https://playwright.dev)
- [Inertia.js Documentation](https://inertiajs.com)
