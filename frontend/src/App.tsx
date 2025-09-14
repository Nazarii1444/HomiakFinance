import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/auth/components/Login';
import Register from './pages/auth/components/Registration';
import {Provider} from 'react-redux';
import {store} from './store';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace/>}/>

                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>

                    <Route path="*" element={<Navigate to="/login" replace/>}/>
                </Routes>
            </Router>
        </Provider>
    );
}

export default App;