const fs = require('fs');
let code = fs.readFileSync('client/src/components/AgentPage.tsx', 'utf8');

// The broken section starts at the selectedWorkspace ? branch and ends before the modal comment.
// We'll replace from the ternary block that starts with "selectedWorkspace ?" 
// Find the broken block by locating unique markers.

const brokenStart = `         ) : selectedWorkspace ? (`;
const brokenEnd = `         {/* Application Detail View Modal for Agent */}`;

const startIdx = code.indexOf(brokenStart);
const endIdx = code.indexOf(brokenEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const fixedSection = `         ) : selectedWorkspace ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-12"
            >
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black/5 pb-6">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
                        <button onClick={() => setSelectedWorkspace(null)} className="hover:text-black transition-colors">Workspaces</button>
                        <ChevronRight size={10} />
                        <span className="text-black">{selectedWorkspace.name}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">{selectedWorkspace.name}.</h2>
                        {selectedWorkspace.permission === 'Read-only' && (
                           <span className="px-3 py-1 bg-black/5 rounded-full text-[10px] tracking-widest text-black/40 flex items-center gap-1">
                              <ShieldAlert size={12} /> Read-only
                           </span>
                        )}
                     </div>
                  </div>

                  {selectedWorkspace.permission !== 'Read-only' && permissions.canUploadFiles && (
                     <button 
                        onClick={() => handleFileUpload(\`Agent_Upload_\${Math.floor(Math.random()*100)}.pdf\`)}
                        disabled={isUploading}
                        className="px-6 py-2 bg-black text-white rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-20 flex items-center gap-2"
                     >
                        <UploadCloudIcon size={16} /> {isUploading ? "Uploading..." : "Add File"}
                     </button>
                  )}
               </div>

               <div className="space-y-4">
                  {workspaceFiles.length === 0 ? (
                     <div className="py-32 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[10px] gap-4">
                        <Folder size={48} className="opacity-50" />
                        No Documents Found
                     </div>
                  ) : (
                     <div className="grid gap-3">
                        {workspaceFiles.map(file => (
                           <div
                             key={file.id}
                             onClick={() => handleFilePreview(file.id)}
                             className="group flex items-center justify-between px-4 py-2 bg-black/[0.02] border border-black/5 rounded-[16px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer"
                           >
                              <div className="flex items-center gap-6">
                                 <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                                    <span className="text-black/90 text-2xl">📄</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold">{file.name}</span>
                                    <span className="text-[8px] uppercase tracking-widest font-bold text-black/50">
                                       {file.size} • {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-2 transition-opacity">
                                 <button
                                   onClick={(e) => { e.stopPropagation(); handleFilePreview(file.id); }}
                                   className="p-3 hover:bg-black/5 rounded-full transition-all"
                                   title="Preview / Download"
                                 >
                                    <DownloadCloudIcon size={16} />
                                 </button>
                                 {selectedWorkspace.permission !== 'Read-only' && permissions.canDeleteFiles && (
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); handleFileDelete(file.id); }}
                                       className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </motion.div>
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {activeTab === 'workspaces' ? (
                  <>
                     <div className="relative max-w-md">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                        <input 
                           type="text" 
                           placeholder="Search your workspaces..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-black/10 text-sm focus:outline-none focus:border-black placeholder:text-black/40 font-bold transition-all"
                        />
                     </div>

                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredWorkspaces.map(ws => (
                           <div 
                              key={ws.id}
                              onClick={() => handleSelectWorkspace(ws)}
                              className="group bg-white border border-black/5 rounded-[16px] p-8 flex flex-col justify-between h-[180px] hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer"
                           >
                              <div className="flex justify-between items-start">
                                 <div className="w-10 h-10 bg-black/5 text-black rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                    <Folder size={18} />
                                 </div>
                                 {ws.permission === 'Read-only' && (
                                    <span className="p-2 bg-black/5 rounded-full text-black/40 group-hover:text-black transition-colors">
                                       <ShieldAlert size={14} />
                                    </span>
                                 )}
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold tracking-tight mb-1">{ws.name}</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-black/30">
                                    {ws.permission} Access
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </>
               ) : (
                  <div className="space-y-12">
                     <div className="relative max-w-md">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                        <input 
                           type="text" 
                           placeholder="Search by name or ID..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-black/10 text-sm focus:outline-none focus:border-black placeholder:text-black/40 font-bold transition-all"
                        />
                     </div>

                     <div className="space-y-0">
                        {applications.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map(app => (
                           <div 
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className="group flex items-center justify-between py-4 px-4 border-b border-black/5 hover:bg-black/[0.02] transition-all cursor-pointer"
                           >
                              <div className="flex items-center gap-12">
                                 <span className="text-[10px] max-w-[20px] sm:max-w-none font-mono font-bold text-black/50">#{app.id}</span>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold">{app.name}</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-black/30">
                                       {new Date(app.submittedAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-4">
                                    {app.status === 'Reviewing' && app.reviewerId && (
                                       <div className="flex items-center gap-2 pr-4 border-r border-black/5">
                                          <div className="flex items-center -space-x-1">
                                             <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-sm relative z-10">
                                                <img 
                                                   src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${app.reviewerName}\${app.reviewerId}\`} 
                                                   alt={app.reviewerName}
                                                   className="w-full h-full object-cover"
                                                />
                                             </div>
                                             <div className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight pl-3 border border-blue-500/10">
                                                {app.reviewerName?.split(' ')[0]}
                                             </div>
                                          </div>
                                          <span className="text-[8px] font-bold text-black/20 hidden lg:block italic">
                                             {timeAgo(app.lastActivityAt)}
                                          </span>
                                       </div>
                                    )}
                                    <StatusPill status={app.status} />
                                 </div>
                                 <ChevronRight size={12} className="text-black/40 group-hover:text-black transition-all" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </motion.div>
         )}

         `;

code = code.slice(0, startIdx) + fixedSection + code.slice(endIdx);

fs.writeFileSync('client/src/components/AgentPage.tsx', code);
console.log('Workspace section restored successfully.');
