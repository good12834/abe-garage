import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaPlus, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('services');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Auth Token Helper
    const authHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    useEffect(() => {
        if (!user) navigate('/admin/login');
        fetchData();
    }, [activeTab, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'services') endpoint = '/api/services';
            if (activeTab === 'projects') endpoint = '/api/projects';
            if (activeTab === 'messages') endpoint = '/api/messages';

            const response = await axios.get(`http://localhost:5000${endpoint}`, activeTab === 'messages' ? authHeader() : {});
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            if (activeTab === 'services') await axios.delete(`http://localhost:5000/api/services/${id}`, authHeader());
            if (activeTab === 'projects') await axios.delete(`http://localhost:5000/api/projects/${id}`, authHeader());
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="container mt-5 min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Admin Dashboard</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-secondary">Welcome, {user?.username}</span>
                    <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center gap-2">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>Messages</button>
                </li>
            </ul>

            {/* Content */}
            {loading ? <p>Loading...</p> : (
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <h4 className="text-capitalize">{activeTab} Management</h4>
                            {activeTab !== 'messages' && (
                                <button className="btn btn-success d-flex align-items-center gap-2" onClick={() => alert("Create Modal Not Implemented in this Demo")}>
                                    <FaPlus /> Add New
                                </button>
                            )}
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Title/Name</th>
                                        {activeTab === 'messages' && <th>Email</th>}
                                        {activeTab !== 'messages' && <th>Image</th>}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{activeTab === 'messages' ? item.name : item.title}</td>
                                            {activeTab === 'messages' && <td>{item.email}</td>}
                                            {activeTab !== 'messages' && (
                                                <td>
                                                    <img src={item.image_url} alt="thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover' }} className="rounded" />
                                                </td>
                                            )}
                                            <td>
                                                {activeTab !== 'messages' && (
                                                    <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                                                        <FaTrash />
                                                    </button>
                                                )}
                                                {activeTab === 'messages' && (
                                                    <span className="text-muted small">{new Date(item.created_at).toLocaleDateString()}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr><td colSpan="5" className="text-center">No data found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
