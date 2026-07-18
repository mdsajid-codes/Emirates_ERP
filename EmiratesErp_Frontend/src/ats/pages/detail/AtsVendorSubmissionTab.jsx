import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorSubmissionTab = ({ vendorId }) => {
    const [loading, setLoading] = useState(false);
    const [submissionForm, setSubmissionForm] = useState({
        submissionDescription: '', mailDescription: '', mailingSubject: '', body: ''
    });
    
    const [token1, setToken1] = useState('');
    const [token2, setToken2] = useState('');
    const [token3, setToken3] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/ats/vendors/${vendorId}`, { headers });
                if (res.data && res.data.submissionFormat) {
                    setSubmissionForm(res.data.submissionFormat);
                }
            } catch (err) {
                console.error("Error loading submission format:", err);
                toast.error("Failed to load submission template.");
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) {
            fetchInitialData();
        }
    }, [vendorId]);

    const handleSubmissionUpsert = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.put(`${API_URL}/ats/vendors/${vendorId}/submission-format`, submissionForm, { headers });
            toast.success("Mailing layout saved.");
        } catch (err) {
            toast.error("Failed to update mailing layouts.");
        }
    };

    const handleAddToken = () => {
        const selectedToken = token1 || token2 || token3;
        if (!selectedToken) return;

        if (editorInstance) {
            editorInstance.model.change(writer => {
                const insertPosition = editorInstance.model.document.selection.getFirstPosition();
                writer.insertText(`{${selectedToken}}`, insertPosition);
            });
        }

        setToken1('');
        setToken2('');
        setToken3('');
    };

    if (loading) {
        return (
            <div className="text-center py-6 text-foreground-muted text-sm font-semibold">
                Loading submission template...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmissionUpsert} className="space-y-6 text-foreground font-sans">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Candidate Submission Template</h3>

            {/* Row 1: Token placeholders select bar */}
            <div>
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Vendor Submission Description</label>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={token1}
                        onChange={(e) => { setToken1(e.target.value); setToken2(''); setToken3(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Candidate Field</option>
                        <option value="Candidate Name">Candidate Name</option>
                        <option value="Candidate Email">Candidate Email</option>
                        <option value="Candidate Mobile">Candidate Mobile</option>
                        <option value="Technologies">Technologies</option>
                        <option value="Experience">Experience</option>
                    </select>

                    <select
                        value={token2}
                        onChange={(e) => { setToken2(e.target.value); setToken1(''); setToken3(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Job Field</option>
                        <option value="Job Title">Job Title</option>
                        <option value="Job Code">Job Code</option>
                        <option value="Job Rate">Job Rate</option>
                        <option value="Client Name">Client Name</option>
                    </select>

                    <select
                        value={token3}
                        onChange={(e) => { setToken3(e.target.value); setToken1(''); setToken2(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Vendor Field</option>
                        <option value="Vendor Name">Vendor Name</option>
                        <option value="Primary Recruiter">Primary Recruiter</option>
                        <option value="Submission Date">Submission Date</option>
                    </select>

                    <button
                        type="button"
                        onClick={handleAddToken}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-theme hover:bg-primary/90 transition-colors shadow shadow-primary/10"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </div>

            {/* Row 2: Mailing Subject */}
            <div>
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Mailing Subject</label>
                <input
                    type="text"
                    value={submissionForm.mailingSubject || ''}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, mailingSubject: e.target.value })}
                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Submission for {Job Title} - {Candidate Name}"
                />
            </div>

            {/* Row 3: Body Editor */}
            <div className="space-y-1.5 ck-editor-custom-wrapper">
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Body</label>
                <div className="border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary/40 transition-all">
                    <CKEditor
                        editor={ClassicEditor}
                        data={submissionForm.body || ''}
                        onReady={editor => setEditorInstance(editor)}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setSubmissionForm({ ...submissionForm, body: data });
                        }}
                        config={{
                            placeholder: 'Compose template body here...',
                            toolbar: [
                                'heading', '|',
                                'bold', 'italic', 'underline', 'strikethrough', '|',
                                'bulletedList', 'numberedList', 'blockQuote', '|',
                                'insertTable', 'link', '|',
                                'undo', 'redo'
                            ]
                        }}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-theme hover:bg-primary/90 transition-all shadow shadow-primary/10"
                >
                    Save Submission Format
                </button>
            </div>
        </form>
    );
};

export default AtsVendorSubmissionTab;
