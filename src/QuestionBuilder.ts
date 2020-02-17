import Pokemon from "./models/Pokemon";
import Question from "./models/Question";

export default class QuestionBuilder {
    public Build(pokemon: Pokemon): Question {
        return {
            Prompt: this.generatePrompt(pokemon),
            Answer: pokemon.Name
        };
    }

    private generatePrompt(pokemon: Pokemon): string {
        // Get a random description
        const description: string = pokemon.Descriptions[Math.random() * pokemon.Descriptions.length];
        
        // Convert description and pokemon name to lowercase, and remove any instance of the pokemon name
        // from the prompt
        const lowerCasePokemonName: string = pokemon.Name.toLowerCase();
        const lowerCasePrompt: string = description.toLowerCase().replace(lowerCasePokemonName, "this Pokémon");

        // Convert prompt to sentence case and return
        const sentenceCasePrompt: string = lowerCasePrompt
            .split(".")
            .map(x => x.trim())
            .map(x => x.charAt(0).toUpperCase + x.slice(1))
            .join(". ");
        return sentenceCasePrompt;
    }
}