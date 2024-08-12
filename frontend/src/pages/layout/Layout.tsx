import { useContext, useEffect, useState, useRef } from 'react';
import { BlobServiceClient } from '@azure/storage-blob';
import { Link, Outlet } from 'react-router-dom';
import { Dialog, Stack, TextField, DefaultButton, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { CopyRegular } from '@fluentui/react-icons';

import { CosmosDBStatus } from '../../api';
import Contoso from '../../assets/Contoso.svg';
import { HistoryButton, ShareButton, UploadButton } from '../../components/common/Button';
import { AppStateContext } from '../../state/AppProvider';
import styles from './Layout.module.css';

const Layout = () => {
  const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
  const [copyClicked, setCopyClicked] = useState<boolean>(false);
  const [copyText, setCopyText] = useState<string>('Copy URL');
  const [shareLabel, setShareLabel] = useState<string | undefined>('Share');
  const [hideHistoryLabel, setHideHistoryLabel] = useState<string>('Hide chat history');
  const [showHistoryLabel, setShowHistoryLabel] = useState<string>('Show chat history');
  const [logo, setLogo] = useState('');
  const appStateContext = useContext(AppStateContext);
  const ui = appStateContext?.state.frontendSettings?.ui;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message?: string }>({ success: false });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const sasToken = "sp=racwdli&st=2024-08-08T14:05:04Z&se=2024-08-09T22:05:04Z&sv=2022-11-02&sr=c&sig=tPqfeHjbx52XAG0gx5dErAY%2BFuESCala9Q4Lg5OUMDw%3D";
    const containerName = "ai-scope-app";
    const storageAccountName = "searchservice2storagefr";

    try {
      const blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net/${containerName}?${sasToken}`
      );
      const containerClient = blobServiceClient.getContainerClient(containerName);

      let uploadedFiles = 0;
      for (const file of files) {
        const blockBlobClient = containerClient.getBlockBlobClient(file.name);
        await blockBlobClient.uploadBrowserData(file);
        uploadedFiles++;
        console.log(`Upload of ${file.name} completed successfully.`);
      }

      setUploadStatus({ success: true, message: `Successfully uploaded ${uploadedFiles} file(s).` });
    } catch (err: any) {
      console.error(`Error uploading files: `, err);

      if (err.statusCode === 403) {
        setUploadStatus({ success: false, message: "Permission denied. Check your SAS token." });
      } else if (err.statusCode === 404) {
        setUploadStatus({ success: false, message: "Container not found. Check your container name." });
      } else {
        setUploadStatus({ success: false, message: err.message || "An error occurred during upload." });
      }
    }

    setTimeout(() => setUploadStatus({ success: false }), 5000);
  }

  const handleShareClick = () => {
    setIsSharePanelOpen(true);
  }

  const handleSharePanelDismiss = () => {
    setIsSharePanelOpen(false);
    setCopyClicked(false);
    setCopyText('Copy URL');
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyClicked(true);
  }

  const handleHistoryClick = () => {
    appStateContext?.dispatch({ type: 'TOGGLE_CHAT_HISTORY' });
  }

  useEffect(() => {
    if (!appStateContext?.state.isLoading) {
      setLogo(ui?.logo || Contoso);
    }
  }, [appStateContext?.state.isLoading]);

  useEffect(() => {
    if (copyClicked) {
      setCopyText('Copied URL');
    }
  }, [copyClicked]);

  useEffect(() => { }, [appStateContext?.state.isCosmosDBAvailable.status]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setShareLabel(undefined);
        setHideHistoryLabel('Hide history');
        setShowHistoryLabel('Show history');
      } else {
        setShareLabel('Share');
        setHideHistoryLabel('Hide chat history');
        setShowHistoryLabel('Show chat history');
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.layout}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />
      <header className={styles.header} role={'banner'}>
        <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
          <Stack horizontal verticalAlign="center">
            <img src={logo} className={styles.headerIcon} aria-hidden="true" alt="" />
            <Link to="/" className={styles.headerTitleContainer}>
              <h1 className={styles.headerTitle}>{ui?.title}</h1>
            </Link>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 4 }} className={styles.buttonContainer}>
            <UploadButton onClick={() => fileInputRef.current?.click()} text="Upload Documents" />
            {appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured && ui?.show_chat_history_button !== false && (
              <HistoryButton
                onClick={handleHistoryClick}
                text={appStateContext?.state?.isChatHistoryOpen ? hideHistoryLabel : showHistoryLabel}
              />
            )}
            {ui?.show_share_button && <ShareButton onClick={handleShareClick} text={shareLabel} />}
          </Stack>
        </Stack>
      </header>
      <Outlet />
      {uploadStatus.message && (
        <MessageBar
          messageBarType={uploadStatus.success ? MessageBarType.success : MessageBarType.error}
          onDismiss={() => setUploadStatus({ success: false })}
        >
          {uploadStatus.message}
        </MessageBar>
      )}
      <Dialog
        onDismiss={handleSharePanelDismiss}
        hidden={!isSharePanelOpen}
        styles={{
          main: [
            {
              selectors: {
                ['@media (min-width: 480px)']: {
                  maxWidth: '600px',
                  background: '#FFFFFF',
                  boxShadow: '0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  maxHeight: '200px',
                  minHeight: '100px'
                }
              }
            }
          ]
        }}
        dialogContentProps={{
          title: 'Share the web app',
          showCloseButton: true
        }}>
        <Stack horizontal verticalAlign="center" style={{ gap: '8px' }}>
          <TextField className={styles.urlTextBox} defaultValue={window.location.href} readOnly />
          <div
            className={styles.copyButtonContainer}
            role="button"
            tabIndex={0}
            aria-label="Copy"
            onClick={handleCopyClick}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? handleCopyClick() : null)}>
            <CopyRegular className={styles.copyButton} />
            <span className={styles.copyButtonText}>{copyText}</span>
          </div>
        </Stack>
      </Dialog>
    </div>
  );
}

export default Layout;
