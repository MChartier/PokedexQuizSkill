import Pokemon from "./models/Pokemon";
import Question from "./models/Question";

/**
 * Class used to build questions for a Pokedex quiz.
 */
export default class QuestionBuilder {

    /**
     * Builds a Pokedex question for the given Pokemon.
     * The question is generated using one of the available Pokedex entries included in the Pokemon object.
     * The user will be prompted to identify the Pokemon matching the description.
     * @param pokemon The Pokemon that the player will be asked to identify.
     */
    public Build(pokemon: Pokemon): Question {
        return {
            Prompt: this.generatePrompt(pokemon),
            Answer: pokemon.Name
        };
    }

    /**
     * Generate a question prompt for the given Pokemon.
     * The question prompt is generated by selecting a random Pokedex description for the given Pokemon and
     * then scrubbing the content to remove any references to the Pokemon by name.
     * @param pokemon
     */
    private generatePrompt(pokemon: Pokemon): string {
        // Get a random Pokedex description for the given Pokemon
        const description: string = pokemon.Descriptions[Math.floor(Math.random() * pokemon.Descriptions.length)];
        
        // Remove any reference to the Pokemon species by name from the description
        // E.g. "Pikachu is yellow." -> "This pokemon is yellow."
        const pattern = new RegExp(pokemon.Name, "gi");
        return description.replace(pattern, "this Pokémon");
    }
}