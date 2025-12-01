import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const FormViewer = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
                <p className="text-gray-500">Your response has been successfully recorded.</p>
            </div>
        </div>
    );

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">{error}</div>;
    if (!form) return <div className="min-h-screen flex items-center justify-center text-emerald-600 font-medium animate-pulse">Loading Form...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-emerald-600 h-2"></div>
                <div className="px-8 py-10">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{form.title}</h1>
                        <p className="text-gray-500">{form.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {form.fields.map(field => {
                            if (!shouldShowQuestion(field.conditionalRules)) return null;

                            return (
                                <div key={field.questionKey} className="space-y-2 animate-fadeIn">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {field.type === 'shortText' && (
                                        <input
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                                            value={answers[field.questionKey] || ''}
                                            onChange={e => setAnswers({ ...answers, [field.questionKey]: e.target.value })}
                                            required={field.required}
                                            placeholder="Type your answer..."
                                        />
                                    )}

                                    {field.type === 'longText' && (
                                        <textarea
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                                            rows="4"
                                            value={answers[field.questionKey] || ''}
                                            onChange={e => setAnswers({ ...answers, [field.questionKey]: e.target.value })}
                                            required={field.required}
                                            placeholder="Type your answer..."
                                        />
                                    )}

                                    {field.type === 'singleSelect' && (
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white appearance-none"
                                                value={answers[field.questionKey] || ''}
                                                onChange={e => setAnswers({ ...answers, [field.questionKey]: e.target.value })}
                                                required={field.required}
                                            >
                                                <option value="">Select an option</option>
                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    )}

                                    {field.type === 'multiSelect' && (
                                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {field.options.map(opt => (
                                                <label key={opt} className="flex items-center p-2 rounded hover:bg-white transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                        checked={(answers[field.questionKey] || []).includes(opt)}
                                                        onChange={e => {
                                                            const current = answers[field.questionKey] || [];
                                                            const newAnswers = e.target.checked
                                                                ? [...current, opt]
                                                                : current.filter(v => v !== opt);
                                                            setAnswers({ ...answers, [field.questionKey]: newAnswers });
                                                        }}
                                                    />
                                                    <span className="ml-3 text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {field.type === 'attachment' && (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Paste image URL here"
                                                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                                                value={answers[field.questionKey] || ''}
                                                onChange={e => setAnswers({ ...answers, [field.questionKey]: e.target.value })}
                                                required={field.required}
                                            />
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:-translate-y-0.5"
                            >
                                Submit Response
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormViewer;
