import Question from "./models/Question";
import QuestionBuilder from "./QuestionBuilder";
import PokemonDatabase from "./database/PokemonDatabase";
import Pokemon from "./models/Pokemon";

/**
 * Generates a quiz consisting of a set of Pokemon identification questions.
 */
export default class QuizGenerator {
    private pokemonDatabase: PokemonDatabase;
    private questionBuilder: QuestionBuilder;
    
    constructor(pokemonDatabase: PokemonDatabase, questionBuilder: QuestionBuilder) {
        this.pokemonDatabase = pokemonDatabase;
        this.questionBuilder = questionBuilder;
    }

    /**
     * Generate an array of Pokemon identification questions, each with a unique answer.
     * @param numQuestions Number of questions to be generated.
     */
    public async Generate(numQuestions: number): Promise<Question[]> {
        // Get an array of unique pokemon numbers for which we will generate questions
        const pokemonNumbers: number[] = this.getPokemonNumbers(numQuestions);
        
        // Get the pokemon from the database corresponding to the generated array of numbers
        const pokemon: Pokemon[] = await this.pokemonDatabase.GetPokemonByNumbers(pokemonNumbers);

        // Generate and return an array of questions for each of the retrieved Pokemon species
        return pokemon.map(pkmn => this.questionBuilder.Build(pkmn));
    }

    /**
     * Gets an array of unique Pokemon numbers (between 1 and 807).
     * @param count The number of unique Pokemon numbers to generate.
     */
    private getPokemonNumbers(count: number): number[] {
        const MaxPokemonNumber = 807;

        const set: Set<number> = new Set<number>();
        while (set.size < count) {
            // Likelihood of collisions is quite low, so we just blindly choose random numbers in the range until we
            // have enough unique values.
            const randomPokemonNumber = 1 + Math.floor(Math.random() * MaxPokemonNumber);
            if (!set.has(randomPokemonNumber)) {
                set.add(randomPokemonNumber);
            }
        }

        return Array.from(set.values());
    }
}
