import './App.css';
import EntrenarModelo from './components/EntrenarModelo';
import SubirCSV from './components/SubirCsv';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Deserción Escolar - App Predictiva</h1>
      <EntrenarModelo />
      <hr />
      <SubirCSV/>
    </div>
  );
}

export default App;
