import Chat from "./components/list/chat/details/Chat.jsx";
import Detail from "./components/list/chat/details/Detail.jsx";
import List from "./components/list/List.jsx";
import "./components/list/chat/details/list.css";
const App = () => {
  return (
    <div className="container">
      <List/>
      <Chat/>
      <Detail/>

      </div>
  );
};

export default App;