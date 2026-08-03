import { useEffect } from "react";
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Login, SignUp } from './User_Auth';
import { useAuth } from './Auth_Context';
import { Item_List} from './Item_Card';
import { Blueprint_Menu } from "./Object_Type_Creator.tsx";
import { supabase } from "./supabaseClient.tsx";
import './Item_Card.css'
import './App.css'
import { GridStack } from "gridstack/dist/react";
import type { ComponentProps, ComponentType } from "react";
import "gridstack/dist/gridstack.css";



// 1. VOCABULARY — a normal React component. Nothing special about it.
function Text({ text }: { text: string }) {
  return <div>{text}</div>;
}
const widget = <P extends object>(C: ComponentType<P>) =>
  C as unknown as ComponentType<Record<string, unknown>>;

// 2. LAYOUT — plain data. This is what you'd save to Supabase.
const options: BoardOptions = {
  column: 12,
  cellHeight: 50,
  children: [
    { id: "a", x: 0, y: 0, w: 2, h: 2, component: "Text", props: { text: "Hello" } },
  ],
};

// 3. RENDERER — hands both to the wrapper.

function NavBar() {
  const {user} = useAuth();

  const handleLogOut= async ()=>{
    const {error} = await supabase.auth.signOut(user?.email);
    if (error) {
      console.log(error);
    }
    else {
      console.log("Email: ", user?.email);
    }
  }

  return (
    <nav className="header">
      <div className="header-sec">
      </div>
      <div className="header-sec">
        <button className="header-btn" onClick={handleLogOut}>
          Log Out
        </button>
      </div>
    </nav>
  )
}
type BoardOptions = ComponentProps<typeof GridStack>["options"];


function App() {
  const {user, loading} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user && location.pathname != '/sign-up') {
        navigate('/');
      }
    if (user && location.pathname == '/sign-up') {
      navigate('/item-list');
    }
    }, [user, navigate]);

  return (
    <>
      { user && (<NavBar></NavBar>) }
      
      <div  style={{  backgroundImage: "linear-gradient(rgba(88, 88, 88, 0.01), rgba(88, 88, 88, 0.01)), url(https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/itemBackground.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        margin: "0",
        backgroundAttachment: "fixed"
      }}>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/sign-up" element={<SignUp />}/>
          <Route path="/item-list_1" element={<Item_List />} />
          <Route path="/item-list" element={<Blueprint_Menu />} />
        </Routes>
      </div>
    </>
  )
}

export default App
