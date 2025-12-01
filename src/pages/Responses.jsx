import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const Responses = () => {

    const exportJSON = () => {
        const dataStr = JSON.stringify(responses, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `responses-${id}.json`;
        link.click();
    };

    if (!form) return <div className="min-h-screen flex items-center justify-center text-emerald-600 animate-pulse">Loading Data...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md text-gray-500 hover:text-emerald-600 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                            <p className="text-sm text-gray-500">Total Responses: {responses.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={exportJSON}
                        className="flex items-center px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export JSON
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted At</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Airtable ID</th>
                                    {form.fields.map(f => (
                                        <th key={f.questionKey} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {f.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {responses.map(res => (
                                    <tr key={res._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(res.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-emerald-600 whitespace-nowrap">
                                            {res.airtableRecordId || '-'}
                                        </td>
                                        {form.fields.map(f => (
                                            <td key={f.questionKey} className="px-6 py-4 text-sm text-gray-800">
                                                <div className="max-w-xs truncate">
                                                    {Array.isArray(res.answers[f.questionKey])
                                                        ? res.answers[f.questionKey].join(', ')
                                                        : String(res.answers[f.questionKey] || '')}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {responses.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No responses yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Responses;
