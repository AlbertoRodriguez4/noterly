/*
# Add 'custom' frequency to routines

## Summary
Adds a new 'custom' frequency value to the routines table's CHECK constraint,
allowing users to pick arbitrary days of the week (e.g., Tuesday to Sunday).

## Changes
- Drops the existing CHECK constraint on routines.frequency
- Re-creates it with the additional 'custom' value

## Security
- No RLS or policy changes — existing policies remain valid.
*/

ALTER TABLE routines DROP CONSTRAINT IF EXISTS routines_frequency_check;

ALTER TABLE routines ADD CONSTRAINT routines_frequency_check
  CHECK (frequency IN ('daily','weekdays','weekends','weekly','monthly','custom'));
