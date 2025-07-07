import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

// Diccionario para traducir tipos al español
const tiposES = {
  fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico', fighting: 'Lucha', psychic: 'Psíquico',
  rock: 'Roca', ground: 'Tierra', ice: 'Hielo', bug: 'Bicho', dragon: 'Dragón', ghost: 'Fantasma',
  poison: 'Veneno', normal: 'Normal', flying: 'Volador', dark: 'Siniestro', steel: 'Acero', fairy: 'Hada'
};

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busquedaTipo, setBusquedaTipo] = useState('');
  const [detallesAbiertos, setDetallesAbiertos] = useState({}); // Para mostrar detalles al hacer click

  useEffect(() => {
    const fetchPokemones = async () => {
      try {
        setCargando(true);
        setError(null);
        const fetchedPokemones = [];
        const pokemonIds = new Set();

        while (pokemonIds.size < 12) {
          const randomId = Math.floor(Math.random() * 898) + 1;
          pokemonIds.add(randomId);
        }

        const idsArray = Array.from(pokemonIds);

        for (const id of idsArray) {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
          if (!response.ok) {
            throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
          }
          const data = await response.json();

          // Obtener nombre en español
          let nombreES = '';
          try {
            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
            const speciesData = await speciesRes.json();
            const nombreObj = speciesData.names.find(n => n.language.name === 'es');
            nombreES = nombreObj ? nombreObj.name : data.name;
          } catch {
            nombreES = data.name;
          }

          fetchedPokemones.push({
            id: data.id,
            nombre: nombreES,
            imagen: data.sprites.front_default,
            tipos: data.types.map(typeInfo => typeInfo.type.name),
            altura: data.height,
            peso: data.weight,
            habilidades: data.abilities.map(a => a.ability.name),
            experiencia: data.base_experience
          });
        }

        setPokemones(fetchedPokemones);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPokemones();
  }, []);

  const pokemonesFiltrados = pokemones.filter(pokemon =>
    busquedaTipo === '' ||
    pokemon.tipos.some(tipo =>
      tipo.toLowerCase() === busquedaTipo.toLowerCase()
    )
  );

  const limpiarBusqueda = () => setBusquedaTipo('');

  const toggleDetalles = (id) => {
    setDetallesAbiertos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (cargando) {
    return <div className="pokemon-container">Cargando Pokémon...</div>;
  }

  if (error) {
    return <div className="pokemon-container error">Error: {error}</div>;
  }

  return (
    <div className="pokemon-container">
      <h2>Busca tu Pokemon</h2>

      {/* Buscador */}
      <div className="search-container">
        <select
          value={busquedaTipo}
          onChange={e => setBusquedaTipo(e.target.value)}
          className="buscador-select"
        >
          <option value="">-- Todos los tipos --</option>
          <option value="fire">Fuego</option>
          <option value="water">Agua</option>
          <option value="grass">Planta</option>
          <option value="electric">Eléctrico</option>
          <option value="fighting">Lucha</option>
          <option value="psychic">Psíquico</option>
          <option value="rock">Roca</option>
          <option value="ground">Tierra</option>
          <option value="ice">Hielo</option>
          <option value="bug">Bicho</option>
          <option value="dragon">Dragón</option>
          <option value="ghost">Fantasma</option>
          <option value="poison">Veneno</option>
          <option value="normal">Normal</option>
          <option value="flying">Volador</option>
          <option value="dark">Siniestro</option>
          <option value="steel">Acero</option>
          <option value="fairy">Hada</option>
        </select>

        <button onClick={limpiarBusqueda} className="buscador-limpiar" title="Limpiar selección">
          Limpiar
        </button>
      </div>

      {/* Lista de Pokémon */}
      <div className="pokemon-list">
        {pokemonesFiltrados.length > 0 ? (
          pokemonesFiltrados.map(pokemon => (
            <div key={pokemon.id} className="pokemon-card" onClick={() => toggleDetalles(pokemon.id)} style={{cursor:'pointer'}}>
              <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
              {pokemon.imagen ? (
                <img src={pokemon.imagen} alt={pokemon.nombre} />
              ) : (
                <p>(Sin imagen)</p>
              )}
              <p>
                <strong>Tipos:</strong>{' '}
                {pokemon.tipos && pokemon.tipos.length > 0
                  ? pokemon.tipos.map(type => tiposES[type] || type.charAt(0).toUpperCase() + type.slice(1)).join(', ')
                  : 'Desconocido'}
              </p>
              {detallesAbiertos[pokemon.id] ? (
                <div className="pokemon-detalles">
                  <p><strong>Altura:</strong> {pokemon.altura / 10} m</p>
                  <p><strong>Peso:</strong> {pokemon.peso / 10} kg</p>
                  <p><strong>Habilidades:</strong> {pokemon.habilidades.map(hab => hab.charAt(0).toUpperCase() + hab.slice(1)).join(', ')}</p>
                  <p><strong>Experiencia base:</strong> {pokemon.experiencia}</p>
                  <small>(Haz clic para ocultar info)</small>
                </div>
              ) : (
                <small>(Haz clic para ver más info)</small>
              )}
            </div>
          ))
        ) : (
          <p>No se encontraron Pokémon con ese tipo.</p>
        )}
      </div>
    </div>
  );
};

export default PokemonFetcher;
