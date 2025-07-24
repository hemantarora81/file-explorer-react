import './App.css';
import FileExplorer from './FileExplorer/FileExplorer';
import { fileTree } from './data';

function App() {
  return (
   <FileExplorer treeData={fileTree ??[]}/>
  );
}

export default App;
