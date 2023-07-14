import { debounce } from "lodash";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

const GlobalContext = createContext();

//actions
const Loading = "Loading";
const Get_Pokemon = "Get_Pokemon";
const Get_All_Pokemon = "Get_All_Pokemon";
const GET_SEARCH = "GET_SEARCH";
const GET_POKEMON_DATABASE = "GET_POKEMON_DATABASE";
const NEXT = "NEXT";

//reducer
const reducer = (state, action) => {
  switch (action.type) {
    case Loading:
      return { ...state, loading: true };

    case Get_All_Pokemon:
      return {
        ...state,
        allPokemon: action.payload.results,
        next: action.payload.next,
        loading: false,
      };

    case Get_Pokemon:
      return { ...state, pokemon: action.payload, loading: false };

    case GET_POKEMON_DATABASE:
      return { ...state, pokemonDatabase: action.payload, loading: false };

    case GET_SEARCH:
      return { ...state, searchResults: action.payload, loading: false };

    case NEXT:
      return {
        ...state,
        allPokemon: [...state.allPokemon, ...action.payload.results],
        next: action.payload.next,
        loading: false,
      };
  }
  return state;
};

export const GlobalProvider = ({ children }) => {
  //base url
  const url = "https://pokeapi.co/api/v2/";

  const initialState = {
    allPokemon: [],
    pokemon: {},
    pokemonDatabase: [],
    searchResults: [],
    next: "",
    loading: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const [allPokemonData, setAllPokemonData] = useState([]);

  const allPokemon = async () => {
    dispatch({ type: "Loading" });
    const res = await fetch(`${url}pokemon?limit=20`);
    const data = await res.json();
    dispatch({ type: "Get_All_Pokemon", payload: data });

    //fetch character data
    const allPokemonData = [];

    for (const pokemon of data.results) {
      const PokemonRes = await fetch(pokemon.url);
      const pokemonData = await PokemonRes.json();
      allPokemonData.push(pokemonData);
    }

    setAllPokemonData(allPokemonData);
  };

  //get pokemon
  const getPokemon = async (name) => {
    dispatch({ type: "Loading" });

    const res = await fetch(`${url}pokemon/${name}`);
    const data = await res.json();

    dispatch({ type: "Get_Pokemon", payload: data });
  };

  //get search data
  const getPokemonDatabase = async () => {
    dispatch({ type: "Loading" });

    const res = await fetch(`${url}pokemon?limit=100000&offset=0`);
    const data = await res.json();

    dispatch({ type: "GET_POKEMON_DATABASE", payload: data.results });
  };

  //next page or show more function
  const next = async () => {
    dispatch({ type: "Loading" });
    const res = await fetch(state.next);
    const data = await res.json();
    dispatch({ type: "NEXT", payload: data });

    const newPokemonData = [];
    for (const pokemon of data.results) {
      const PokemonRes = await fetch(pokemon.url);
      const PokemonData = await PokemonRes.json();
      newPokemonData.push(PokemonData);
    }

    setAllPokemonData([...allPokemonData, ...newPokemonData]);
  };

  //real time search
  const realTimeSearch = debounce(async (search) => {
    dispatch({ type: "Loading" });
    //search pokemon database
    const res = state.pokemonDatabase.filter((pokemon) => {
      return pokemon.name.includes(search.toLowerCase());
    });

    dispatch({ type: "GET_SEARCH", payload: res });
  }, 300);

  useEffect(() => {
    getPokemonDatabase();

    allPokemon();
  }, []);
  return (
    <GlobalContext.Provider
      value={{
        ...state,
        allPokemonData,
        getPokemon,
        realTimeSearch,
        next,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
