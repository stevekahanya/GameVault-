import { useEffect, useState } from "react";

import GameCard from "../../components/GameCard/GameCard";
import { getGames } from "../../services/gameApi";
import "../../styles/globals.css";

// Legacy home page kept for compatibility with earlier QuestLog routes.
const Home = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchTrendingGames = async () => {
            try {
                setLoading(true);
                const data = await getGames();
                setGames(data.results || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingGames();
    }, []);

    return (
        <div className="home-page">
      
          <header className="hero-section">
            <div className="hero-content">
              <h1>Track Your Next Adventure</h1>
               <p>Discover trending titles, track your backlog, and manage your ultimate library.</p>
               <button className="hero-cta-btn">Explore Games</button>
            </div>
          </header>

          <section className="trending-games-section">
            <h2>Trending Games</h2>

            {loading && <p className="loading-text">Loading awesome games...</p>}
            {error && <p className="error-text">Oops! {error}</p>}
            {!loading && !error && (
              <div className="games-grid">
               {games.map((singleGame) => (
                 <GameCard key={singleGame.id} game={singleGame} />
              ))}
               </div>
           )}
          </section>

          <footer className="footer-section">
            <div className="footer-content">
                <p>{new Date().getFullYear()} <span className="brand-highlight">QuestLog</span>. All rights reserved.</p>
                <p className="api-attribution">Powered by the <a href="https://rawg.io" target="_blank" rel="noreferrer">RAWG API</a></p>
            </div>
          </footer>
        </div>
    );
}


export default Home;
