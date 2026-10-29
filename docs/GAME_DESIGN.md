# Game Design Notes

## Core loop

Review club condition → manage transfers/finances/training → prepare tactics → simulate a match → review performance → advance calendar → repeat.

## Initial fictional world

The first release uses fictional clubs and players. Player ratings, morale, fitness, wages, market values, and position determine their impact on transfer decisions and match simulation.

## Match simulation

A seeded statistical engine estimates team strength, creates scorelines and event logs, and computes match statistics. The visual layer presents event progression. This model is designed for manager-style play, not direct real-time player control.

## Intended future systems

- Persistent PostgreSQL career saves.
- More nuanced AI negotiation and scouting uncertainty.
- Youth development, injuries, training, staff, facilities, and financial forecasting.
- League and cup scheduling with automated invariants.
- Optional online career synchronization after security and authorization work.
