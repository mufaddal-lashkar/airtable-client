import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const FormBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bases, setBases] = useState([]);
    const [tables, setTables] = useState([]);
    const [availableFields, setAvailableFields] = useState([]);

    const [formData, setFormData] = useState({
        title: 'Untitled Form',
        description: '',
        airtableBaseId: '',
        airtableTableId: '',
        fields: []
    });

    useEffect(() => {
        fetchBases();
        if (id) fetchForm();
    }, [id]);

    const fetchBases = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/airtable/bases`);
            setBases(data);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                alert('Session expired. Please login again.');
                navigate('/');
            } else {
                alert('Failed to fetch Airtable bases. Please ensure you have granted "schema.bases:read" access and try logging out and back in.');
            }
        }
    };

    const fetchForm = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/forms/${id}`);
            setFormData(data);
            if (data.airtableBaseId) fetchTables(data.airtableBaseId);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTables = async (baseId) => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/airtable/bases/${baseId}/tables`);
            setTables(data);
            if (formData.airtableTableId) {
                const table = data.find(t => t.id === formData.airtableTableId);
                if (table) setAvailableFields(table.fields);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBaseChange = (e) => {
        const baseId = e.target.value;
        setFormData({ ...formData, airtableBaseId: baseId, airtableTableId: '', fields: [] });
        fetchTables(baseId);
    };

    const handleTableChange = (e) => {
        const tableId = e.target.value;
        const table = tables.find(t => t.id === tableId);
        setFormData({ ...formData, airtableTableId: tableId, fields: [] });
        setAvailableFields(table ? table.fields : []);
    };

    const addField = (airtableFieldId) => {
        const field = availableFields.find(f => f.id === airtableFieldId);
        if (!field) return;

        let type = 'shortText';
        if (field.type === 'multilineText') type = 'longText';
        if (field.type === 'singleSelect') type = 'singleSelect';
        if (field.type === 'multipleSelects') type = 'multiSelect';
        if (field.type === 'multipleAttachments') type = 'attachment';

        const supported = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments', 'email', 'url', 'phoneNumber', 'number'];
        if (!supported.includes(field.type)) {
            alert('Unsupported field type: ' + field.type);
            return;
        }

        const newField = {
            questionKey: `q${Date.now()}`,
            airtableFieldId: field.id,
            label: field.name,
            type,
            options: field.options ? field.options.choices.map(c => c.name) : [],
            required: false,
            conditionalRules: []
        };

        setFormData({ ...formData, fields: [...formData.fields, newField] });
    };

    const updateField = (index, updates) => {
        const newFields = [...formData.fields];
        newFields[index] = { ...newFields[index], ...updates };
        setFormData({ ...formData, fields: newFields });
    };

    const removeField = (index) => {
        const newFields = [...formData.fields];
        newFields.splice(index, 1);
        setFormData({ ...formData, fields: newFields });
    };

    const saveForm = async () => {
        try {
            if (id) {
                await axios.put(`${API_BASE_URL}/api/forms/${id}`, formData);
            } else {
                await axios.post(`${API_BASE_URL}/api/forms`, formData);
            }
            navigate('/dashboard');
        } catch (error) {
            alert('Error saving form');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Settings */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/dashboard" className="text-gray-400 hover:text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">{id ? 'Edit Form' : 'New Form'}</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* General Settings */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">General Settings</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="My Awesome Form"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                rows="3"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your form..."
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Airtable Source */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Source</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Airtable Base</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                value={formData.airtableBaseId}
                                onChange={handleBaseChange}
                                disabled={!!id}
                            >
                                <option value="">Select Base</option>
                                {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                value={formData.airtableTableId}
                                onChange={handleTableChange}
                                disabled={!formData.airtableBaseId || !!id}
                            >
                                <option value="">Select Table</option>
                                {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Available Fields */}
                    {formData.airtableTableId && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Add Fields</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {availableFields.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => addField(f.id)}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-gray-50 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all group"
                                    >
                                        <span className="font-medium truncate">{f.name}</span>
                                        <span className="text-xs text-gray-400 group-hover:text-emerald-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">{f.type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={saveForm}
                        className="w-full px-4 py-3 font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                    >
                        Save & Publish
                    </button>
                </div>
            </div>

            {/* Main Content - Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Form Header Preview */}
                        <div className="bg-emerald-600 h-3"></div>
                        <div className="p-8 border-b border-gray-100">
                            <h1 className="text-3xl font-bold text-gray-900">{formData.title || 'Untitled Form'}</h1>
                            <p className="mt-2 text-gray-500">{formData.description || 'No description provided.'}</p>
                        </div>

                        {/* Fields List */}
                        <div className="p-8 space-y-6 bg-gray-50/50 min-h-[400px]">
                            {formData.fields.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <p className="text-gray-400">Select fields from the sidebar to start building your form.</p>
                                </div>
                            ) : (
                                formData.fields.map((field, index) => (
                                    <div key={field.questionKey} className="group relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => removeField(index)} className="text-gray-400 hover:text-red-500 p-1">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Label</label>
                                            <input
                                                className="w-full text-lg font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none bg-transparent transition-colors"
                                                value={field.label}
                                                onChange={e => updateField(index, { label: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex items-center gap-6 mb-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                    checked={field.required}
                                                    onChange={e => updateField(index, { required: e.target.checked })}
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Required</span>
                                            </label>
                                        </div>

                                        {/* Logic Builder */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Conditional Logic</span>
                                                <button
                                                    onClick={() => updateField(index, { conditionalRules: [...field.conditionalRules, { questionKey: '', operator: 'equals', value: '' }] })}
                                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                                >
                                                    + Add Rule
                                                </button>
                                            </div>

                                            {field.conditionalRules.length > 0 && (
                                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-2">Show this question if:</p>
                                                    {field.conditionalRules.map((rule, rIndex) => (
                                                        <div key={rIndex} className="flex gap-2 items-center">
                                                            <select
                                                                className="flex-1 text-sm p-1.5 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                                value={rule.questionKey}
                                                                onChange={e => {
                                                                    const newRules = [...field.conditionalRules];
                                                                    newRules[rIndex].questionKey = e.target.value;
                                                                    updateField(index, { conditionalRules: newRules });
                                                                }}
                                                            >
                                                                <option value="">Select Question</option>
                                                                {formData.fields.slice(0, index).map(q => (
                                                                    <option key={q.questionKey} value={q.questionKey}>{q.label}</option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                className="w-24 text-sm p-1.5 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                                value={rule.operator}
                                                                onChange={e => {
                                                                    const newRules = [...field.conditionalRules];
                                                                    newRules[rIndex].operator = e.target.value;
                                                                    updateField(index, { conditionalRules: newRules });
                                                                }}
                                                            >
                                                                <option value="equals">Equals</option>
                                                                <option value="notEquals">Not Is</option>
                                                                <option value="contains">Contains</option>
                                                            </select>
                                                            <input
                                                                className="flex-1 text-sm p-1.5 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                                value={rule.value}
                                                                placeholder="Value"
                                                                onChange={e => {
                                                                    const newRules = [...field.conditionalRules];
                                                                    newRules[rIndex].value = e.target.value;
                                                                    updateField(index, { conditionalRules: newRules });
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newRules = field.conditionalRules.filter((_, i) => i !== rIndex);
                                                                    updateField(index, { conditionalRules: newRules });
                                                                }}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
