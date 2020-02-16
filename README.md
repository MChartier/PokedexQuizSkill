# PokedexQuizSkill
PokedexQuizSkill is an Alexa skill built with Node.js that enables users to play a quiz game where they attempt to guess the name of a species of Pokémon given a corresponding Pokédex description.

PokedexQuizSkill is available for free on the Alexa Skill Store as [Pokedex Quiz (Unofficial)](https://www.amazon.com/Matthew-Chartier-Pokedex-Quiz-Unofficial/dp/B0721G7JVM). Try it out on any Alexa-enabled device!

## Setup

### Install Dependencies
Install dependencies before building the project and running tests.

```
yarn install
```

### Build
The 'build' script runs the TypeScript compiler and outputs build artifacts into the 'dist' directory.

```
yarn run build
```

### Test
The 'test' script uses jest to execute a suite of unit tests.

```
yarn run test
```

### Pack
The 'pack' script packages built artifacts and bundled dependencies in a zip file that can be deployed to AWS Lambda.

```
yarn run pack
```