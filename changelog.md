# Changelog

## [2.0.2] - 2020-03-28
### Fixed
- Handle CC0 properly even if improper symbols are present.

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
