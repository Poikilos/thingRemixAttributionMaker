# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [4.0.0] - 2023-03-02
### Fixed
- Adapt to the latest changes to the site (change from className to class and removed button* classes)


## [3.0.0] - 2023-01-07
### Fixed
- Adapt to the latest change to the site.


## [2.1.3] - 2021-08-24
### Fixed
- Fix two incorrect checks of the short license string.


## [2.1.2] - 2021-08-24
### Fixed
- Fix a misplaced `else if`.


## [2.1.1] - 2021-08-24
### Changed
- Refactor the code to make more of it reusable.


## [unreleased] - 2021-06-11
### Fixed
- Correct the case of "Thingiverse" (That is the correct case).


## [2.1.0] - 2021-06-11
### Added
- Add lookup tables to detect the license short name and long name from the URL if necessary

### Changed
- Add a `verbose` boolean instead of commenting verbose output lines.
- Improve verbose output (Add quotes around values, provide more explanations, and log more situations).

### Fixed
- Handle broken the current broken website layout or other issues that cause the license clause list to be missing by deriving the short and long license names from the URL.


## [2.0.2] - 2020-03-28
### Fixed
- Handle CC0 properly even if improper symbols are present.
- Fix a mixture of spaces and tabs in some places.

## [2.0.1] - 2020-03-28
### Changed
- Mimic the old button style using the new button classes with a custom
  `background-color` (otherwise `button button-secondary` is white on
  light gray as of March 28, 2020).

## [2.0] - 2020-03-28
### Changed
- Change the tab width to two spaces to match Firefox's script editor.
- Make the script work with the new thingiverse.com which is a React
  app.
  - Add a periodic event that ensures that the page is loaded.
  - Create functions to gather elements using a class name prefix
    instead of a full class name.
- Add needle (search string) variables for clarity of meaning and to
  ensure that all uses match whenever there is a change.


## [1.0 (greesyfork.org)] - 2020-01-03
### Changed
- The checkbox or error doesn't appear more than once on the button.
- The unnecessary loop is removed.
