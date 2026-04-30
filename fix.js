const fs = require('fs');
let code = fs.readFileSync('client/src/components/AgentPage.tsx', 'utf8');

code = code.replace(/Phone\s+Check/g, 'Phone,\n  Check');

if (!code.includes('AssignAgentModal')) {
    code = code.replace(
        /import \{ RefundModal \} from '\.\/admin\/RefundModal';/,
        'import { RefundModal } from \'./admin/RefundModal\';\nimport { AssignAgentModal } from \'./admin/AssignAgentModal\';'
    );
}

const stateVars = `
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDocsExpanded, setIsDocsExpanded] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleViewAttachment = async (attachment: any) => {
    if (!selectedApp) return;
    try {
      const response = await applicationApi.getAttachmentPreviewUrl(selectedApp._id || selectedApp.id, attachment.url);
      if (response.success && response.previewUrl) {
        window.open(response.previewUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to get preview URL', error);
      alert('Error: Access denied or file not found.');
    }
  };
`;
if (!code.includes('isAssignModalOpen')) {
    code = code.replace(/const \[search, setSearch\] = useState\(\"\"\);/, 'const [search, setSearch] = useState(\"\");\n' + stateVars);
}

code = code.replace(/mockApi\.updateApplicationStatus\(\(pendingRefundApp\._id \|\| pendingRefundApp\.id\) as string, 'Rejected', false, refundData\);/g, 'applicationApi.updateStatus((pendingRefundApp._id || pendingRefundApp.id) as string, \'Rejected\');');

// Also update application details button mockApi calls for upload
code = code.replace(/mockApi\.uploadApplicationDocument\(/g, 'applicationApi.uploadFinalDocument(');

fs.writeFileSync('client/src/components/AgentPage.tsx', code);
console.log('Fixed TypeScript errors');
