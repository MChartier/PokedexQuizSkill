import Pokemon from "../models/Pokemon";
import { DocumentClient, GetItemOutput, BatchGetItemOutput, BatchGetItemInput, Key } from "aws-sdk/clients/dynamodb";
import DynamoDB = require("aws-sdk/clients/dynamodb");

export default class PokemonDatabase {

    private docClient: DocumentClient;
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AWS = require('aws-sdk');
        AWS.config.update({
            region: 'us-east-1'
        });

        this.docClient = new AWS.DynamoDB.DocumentClient();
    }

    async GetPokemonByName(pokemonName: string): Promise<Pokemon> {
        console.log(`GetPokemonByName: ${pokemonName}`);
        return this.getPokemonByName(pokemonName);
    }

    async GetPokemonByNumber(pokemonNumber: number): Promise<Pokemon> {
        console.log(`GetPokemonByNumber: ${pokemonNumber}`);
        return this.getPokemonByNumber(pokemonNumber);
    }

    async GetPokemonByNumbers(pokemonNumbers: number[]): Promise<Pokemon[]> {
        console.log(`GetPokemonByNumber: ${pokemonNumbers}`);
        return this.getPokemonByNumbers(pokemonNumbers);
    }

    async GetRandomPokemon(): Promise<Pokemon> {
        const numPokemon = 807;
        const randomNumber = Math.floor(Math.random() * numPokemon + 1);
        return await this.GetPokemonByNumber(randomNumber);
    }

    private async getPokemonByName(pokemonName: string): Promise<Pokemon> {
        const params = {
            TableName: "PokemonNumbers",
            Key: {
                "Name": pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)
            }
        };

        const response: GetItemOutput = await this.docClient.get(params).promise();
        if (!response || !response.Item) {
            if (!response || !response.Item) {
                console.log("Invalid response from DynamoDB");
                console.log(response);
            }

            throw response;
        }

        const pokemonNumber = Number(response.Item['Number']);
        return this.getPokemonByNumber(pokemonNumber);
    }

    private async getPokemonByNumber(pokemonNumber: number): Promise<Pokemon> {
        const params = {
            TableName: "PokemonDescriptions",
            Key: { 
                "Id" : pokemonNumber
            }
        };

        const response: GetItemOutput = await this.docClient.get(params).promise();
        if (!response || !response.Item) {
            console.log("Invalid response from DynamoDB");
            console.log(response);
            
            throw response;
        }

        return this.rowToPokemon(response.Item);
    }

    private async getPokemonByNumbers(pokemonNumbers: number[]): Promise<Pokemon[]> {        
        const keys: object[] = Array.from(pokemonNumbers.map<object>(pkmn => {
            return {
                "Id": pkmn
            };
        }));
        const params = {
            RequestItems: {
                "PokemonDescriptions": {
                    Keys: keys
                }
            }
        };

        console.log(JSON.stringify(params));
        const response: BatchGetItemOutput = await this.docClient.batchGet(params).promise();
        if (!response || !response.Responses) {
            console.log("Invalid response from DynamoDB");
            console.log(response);
            
            throw response;
        }

        const items = Array.from(response.Responses["PokemonDescriptions"].values());
        return items.map(row => this.rowToPokemon(row));
    }

    private rowToPokemon(row: any): Pokemon {
        if (!row.Name || !row.Genus || !row.Descriptions) {           
            console.log("Invalid response from DynamoDB");
            console.log(row);

            throw row;
        }

        return {
            Name: row.Name,
            Number: Number(row.Id),
            Genus: row.Genus,
            Descriptions: row.Descriptions.values
        };
    }
}
