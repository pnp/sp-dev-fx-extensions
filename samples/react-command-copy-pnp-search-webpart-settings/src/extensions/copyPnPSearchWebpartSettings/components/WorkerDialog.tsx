import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    Dialog, DialogType, DialogFooter,
    DefaultButton, PrimaryButton,
    Dropdown, IDropdownOption,
    Stack, IStackTokens, IStackItemStyles, IStackStyles,
    Spinner, SpinnerSize,
    MessageBar, MessageBarType, List, TextField, Toggle,
    Label, ILabelStyles
} from '@fluentui/react';
import { getThemeColor } from '../themeHelper';
import { FontSizes, FontWeights } from '@fluentui/theme';
import { mergeStyleSets, normalize } from '@fluentui/react/lib/Styling';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/clientside-pages/web";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/theme-monokai";

interface IWorkerDialogProps {
    hidden: boolean;
    fileRefs: string[];
    folderUrl: string;
    siteUrl: string;
    close: () => void;
}

const WorkerDialog: React.FunctionComponent<IWorkerDialogProps> = (props) => {
    const [hideDialog, setHideDialog] = useState<boolean>(props.hidden);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>(null);

    const [sourcePageLink, setSourcePageLink] = useState<string>(null);
    const [sourceWebpartSectionVertical, setSourceWebpartSectionVertical] = useState<boolean>(false);
    const [sourceWebpartSectionNumber, setSourceWebpartSectionNumber] = useState<string>(null);
    const [sourceWebpartColumnNumber, setSourceWebpartColumnNumber] = useState<string>(null);
    const [sourceWebpartControlNumber, setSourceWebpartControlNumber] = useState<string>(null);
    const [sourceWebpartType, setSourceWebpartType] = useState<IDropdownOption>(null);

    const [sourceWebpartDynamicDataValues, setsourceWebpartDynamicDataValues] = useState<any>(null);
    const [sourceWebpartProperties, setSourceWebpartProperties] = useState<any>(null);

    const [destinationWebpartSectionVertical, setDestinationWebpartSectionVertical] = useState<boolean>(false);
    const [destinationWebpartSectionNumber, setDestinationWebpartSectionNumber] = useState<string>(null);
    const [destinationWebpartColumnNumber, setDestinationWebpartColumnNumber] = useState<string>(null);
    const [destinationWebpartControlNumber, setDestinationWebpartControlNumber] = useState<string>(null);
    const [destinationPagesSuccessful, setDestinationPagesSuccessful] = useState<string[]>([]);
    const [destinationPagesUnsuccessful, setDestinationPagesUnsuccessful] = useState<string[]>([]);

    const [showPnPJSCode, setShowPnPJSCode] = useState<boolean>(false);
    const [showPnPPSCode, setShowPnPPSCode] = useState<boolean>(false);
    const [pnpjsCode, setPnPJSCode] = useState<string>(null);
    const [pnpPSCode, setPnPPSCode] = useState<string>(null);
    const [allDataOk, setAllDataOk] = useState<boolean>(false);


    const mainLabelStyles: ILabelStyles = {
        root: {
            fontSize: FontSizes.size18,
            fontWeight: FontWeights.semibold
        }
    };

    const stackStyles: IStackStyles = {
    };

    const stackItemStyles: IStackItemStyles = {
        root: {
            height: 'auto'
        },
    };

    const stackTokens: IStackTokens = {
        childrenGap: 5
    };

    const horizontalStackTokens: IStackTokens = {
        childrenGap: 5
    };


    const styles = mergeStyleSets({
        container: {
            overflow: 'auto',
            height: 150,
            border: '1px solid #CCC',
            marginTop: 5,
            selectors: {
                '.ms-List-cell': {
                    height: 30,
                    lineHeight: 28,
                },
                '.ms-List-cell:nth-child(odd)': {
                    background: getThemeColor("neutralLighter"),
                }
            },
        },
        itemContent: [
            normalize,
            {
                position: 'relative',
                boxSizing: 'border-box',
                display: 'block',
                borderLeft: '3px solid ' + getThemeColor("themePrimary"),
                paddingLeft: 10,
                marginBottom: 2
            }
        ],
        itemLink: [
            normalize,
            {
                textDecoration: 'none',
                color: getThemeColor("themePrimary")
            }
        ]
    });

    const searchDropdownOptions: IDropdownOption[] = [
        { key: '544c1372-42df-47c3-94d6-017428cd2baf', text: 'Search results v4' },
        { key: '42ad2740-3c60-49cf-971a-c44e33511b93', text: 'Search results v3' }
    ];

    const onSearchDropdownChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        setSourceWebpartType(item);
    };

    const getSourceWebpartSettings = async (): Promise<void> => {

        setLoading(true);
        setErrorMessage(null);
        setDestinationPagesSuccessful([]);
        setDestinationPagesUnsuccessful([]);

        const sourcePage = await sp.web.loadClientsidePage(props.folderUrl + sourcePageLink);

        const sourcePageSection = sourceWebpartSectionVertical ? sourcePage?.verticalSection : sourcePage?.sections[sourceWebpartSectionNumber];
        const sourcePageColumn = sourcePageSection?.columns[sourceWebpartColumnNumber];
        const sourceSearchWebPart = sourcePageColumn?.getControl(sourceWebpartControlNumber);

        if (sourceSearchWebPart === null || sourceSearchWebPart === undefined) {
            setLoading(false);
            setErrorMessage("Source webpart doesn't exist");
            return;
        }

        const sourceSearchWebPartId = sourceSearchWebPart?.json?.webPartId;
        if (sourceSearchWebPartId !== sourceWebpartType.key) {
            setLoading(false);
            setErrorMessage("Source webpart is different than selected one");
            return;
        }

        setSourceWebpartProperties(sourceSearchWebPart?.json?.webPartData?.properties);
        setsourceWebpartDynamicDataValues(sourceSearchWebPart?.json?.webPartData?.dynamicDataValues);

    };

    const updateDestinationWebpartSettings = async (): Promise<void> => {

        let successfulPages: string[] = [];
        let unsuccessfulPages: string[] = [];

        for (const fileRef of props.fileRefs) {

            const destinationPage = await sp.web.loadClientsidePage(fileRef);
            const destinationPageSection = destinationWebpartSectionVertical ? destinationPage?.verticalSection : destinationPage?.sections[destinationWebpartSectionNumber];
            const destinationPageColumn = destinationPageSection?.columns[destinationWebpartColumnNumber];
            const destinationSearchWebpart = destinationPageColumn?.getControl(destinationWebpartControlNumber);

            if (destinationSearchWebpart) {

                const destinationSearchWebpartId = destinationSearchWebpart?.json?.webPartId;

                if (destinationSearchWebpartId === sourceWebpartType.key) {

                    const destinationPageThumbnailUrl: string = destinationPage.thumbnailUrl;

                    destinationSearchWebpart.json.webPartData.properties = sourceWebpartProperties;
                    destinationSearchWebpart.json.webPartData.dynamicDataValues = sourceWebpartDynamicDataValues;

                    destinationPage.thumbnailUrl = destinationPageThumbnailUrl;
                    await destinationPage.save()
                        .then(() => {
                            successfulPages.push(fileRef);
                            setDestinationPagesSuccessful([...successfulPages]);

                        }).catch((error) => {
                            console.error(error);
                            unsuccessfulPages.push(fileRef);
                            setDestinationPagesUnsuccessful([...unsuccessfulPages]);
                        });

                    continue;
                }
            }
            unsuccessfulPages.push(fileRef);
            setDestinationPagesUnsuccessful([...unsuccessfulPages]);
        }
    };

    const updateDestinationWebpartSettingsUsingBatch = async (): Promise<void> => {

        let successfulPages: string[] = [];
        let unsuccessfulPages: string[] = [];

        let batch = sp.web.createBatch();

        for (const fileRef of props.fileRefs) {
            const destinationPage = await sp.web.loadClientsidePage(fileRef);
            const destinationPageSection = destinationPage?.sections[destinationWebpartSectionNumber];
            const destinationPageColumn = destinationPageSection?.columns[destinationWebpartColumnNumber];
            const destinationSearchWebpart = destinationPageColumn?.getControl(destinationWebpartControlNumber);

            if (destinationSearchWebpart) {

                const destinationSearchWebpartId = destinationSearchWebpart?.json?.webPartId;

                if (destinationSearchWebpartId === sourceWebpartType.key) {

                    const destinationPageThumbnailUrl: string = destinationPage.thumbnailUrl;

                    destinationSearchWebpart.json.webPartData.properties = sourceWebpartProperties;
                    destinationSearchWebpart.json.webPartData.dynamicDataValues = sourceWebpartDynamicDataValues;

                    destinationPage.thumbnailUrl = destinationPageThumbnailUrl;

                    destinationPage.inBatch(batch).save()
                        .then(() => {
                            successfulPages.push(fileRef);
                            setDestinationPagesSuccessful([...successfulPages]);

                        }).catch((error) => {
                            console.error(error);
                            unsuccessfulPages.push(fileRef);
                            setDestinationPagesUnsuccessful([...unsuccessfulPages]);
                        });

                    // successfulPages.push(fileRef);
                    continue;
                }
            }
            unsuccessfulPages.push(fileRef);
            setDestinationPagesUnsuccessful([...unsuccessfulPages]);
        }

        await batch.execute()
            .then(() => {
                // setDestinationPagesSuccessful(successfulPages);
                // setDestinationPagesUnsuccessful(unsuccessfulPages);
            })
            .catch((error) => {
                setErrorMessage(error);
            });

    };

    const onRenderCell = (item: string): JSX.Element => {
        let fileRef = /[^/]*$/.exec(item)[0];
        return (
            <div data-is-focusable>
                <div className={styles.itemContent}>
                    <a className={styles.itemLink} href={`${props.folderUrl}${fileRef}`} target="_blank">{fileRef}</a>
                </div>
            </div>
        );
    };

    const onShowPnPJSCodeChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setShowPnPJSCode(checked);
    };

    const onShowPnPPSCodeChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setShowPnPPSCode(checked);
    };

    const onSourceSectionVerticalChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setSourceWebpartSectionVertical(checked);
    };

    const onDestinationSectionVerticalChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setDestinationWebpartSectionVertical(checked);
    };

    const reset = () => {
        setSourcePageLink(null);
        setSourceWebpartType(null);
        setSourceWebpartSectionVertical(false);
        setSourceWebpartSectionNumber(null);
        setSourceWebpartColumnNumber(null);
        setSourceWebpartControlNumber(null);
        setDestinationWebpartSectionVertical(false);
        setDestinationWebpartSectionNumber(null);
        setDestinationWebpartColumnNumber(null);
        setDestinationWebpartControlNumber(null);
        setDestinationPagesSuccessful([]);
        setDestinationPagesUnsuccessful([]);
        setErrorMessage(null);
    };

    useEffect(() => {
        setHideDialog(props.hidden);
    }, [props.hidden]);

    useEffect(() => {
        if (sourceWebpartProperties && sourceWebpartDynamicDataValues) {
            updateDestinationWebpartSettings()
                .then(() => {
                    setLoading(false);
                }).catch((error: any) => {
                    console.error(error);
                    setErrorMessage(error);
                    setLoading(false);
                });
        }

    }, [sourceWebpartProperties, sourceWebpartDynamicDataValues]);

    useEffect(() => {

        if (!sourcePageLink || !sourceWebpartType ||
            (!sourceWebpartSectionVertical && !sourceWebpartSectionNumber) || !sourceWebpartColumnNumber || !sourceWebpartControlNumber ||
            (!destinationWebpartSectionVertical && !destinationWebpartSectionNumber) || !destinationWebpartColumnNumber || !destinationWebpartControlNumber) {
            setAllDataOk(false);
        } else {
            setAllDataOk(true);
            setPnPJSCode(`
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

class CopySettings {
    sourcePage: string;
    destinationPages: string[];
    sourceWebPartProps: any;
    dynamicDataValues: any;
    savedPages: string[];
    skippedPages: string[];

    constructor(sourcePage: string, destinationPages: string[]) {
        this.sourcePage = sourcePage;
        this.destinationPages = destinationPages;
        this.savedPages = [];
        this.skippedPages = [];
    }

    getSourceWebpartSettings = async (fileRef: string) => {
        const page = await sp.web.loadClientsidePage(fileRef);
        const section = ${sourceWebpartSectionVertical ? `page.verticalSection` : `page.sections[${sourceWebpartSectionNumber}]`};

        const column = section && section.columns[${sourceWebpartColumnNumber}];
        const part = column && column.getControl(${sourceWebpartControlNumber});

        this.sourceWebPartProps = part && part.json && part.json.webPartData && part.json.webPartData.properties;
        this.dynamicDataValues = part && part.json && part.json.webPartData && part.json.webPartData.dynamicDataValues;
    };

    updateDestinationWebpartSettings =
        async (fileRef: string, pageNumber: number,
            sectionNumber: number, columnNumber: number, partNumber: number,
            partId: string) => {
            const page = await sp.web.loadClientsidePage(fileRef);
            const thumbnailUrl = page.thumbnailUrl;

            const section = ${destinationWebpartSectionVertical ? `page.verticalSection` : `page.sections[sectionNumber]`};
            const column = section && section.columns[columnNumber];
            const part = column && column.getControl(partNumber);

            const webPartId = part?.json?.webPartId;

            if (webPartId === partId && this.sourceWebPartProps && this.dynamicDataValues) {
                part.json.webPartData.properties = this.sourceWebPartProps;
                part.json.webPartData.dynamicDataValues = this.dynamicDataValues;

                console.info("Saving %s", fileRef);
                await page.save();

                page.thumbnailUrl = thumbnailUrl;
                await page.save();

                this.savedPages.push(fileRef);
                console.log("🚀 Completed page number", pageNumber);
                console.log("🚀 Fileref", fileRef);
            } else {
                this.skippedPages.push(fileRef);
                console.warn("Skipping %s", fileRef);
                console.warn("Skipping Page number", pageNumber);
            }
        };

    startCopying = async () => {

        await this.getSourceWebpartSettings(this.sourcePage);

        for (let index = 0; index < this.destinationPages.length; index++) {
            const pageLink = this.destinationPages[index];
            await this.updateDestinationWebpartSettings(pageLink, index + 1, ${destinationWebpartSectionNumber}, ${destinationWebpartColumnNumber}, ${destinationWebpartControlNumber}, "${sourceWebpartType?.key}");
        }

        console.log("Saved Pages %o", this.savedPages);
        console.warn("Skipped Pages %o", this.skippedPages);
    }
}

(async () => {

    const sourcePage: string = "${props.folderUrl + sourcePageLink}";

    const destinationPages: string[] = [${props.fileRefs.map(f => `\n            "${f}"`)}\n     ];

    const copySettings = new CopySettings(
        sourcePage,
        destinationPages
    );

    await copySettings.startCopying();

    console.log("🚀 Script completed");

})().catch(console.log)
            `);
            setPnPPSCode(`
$sourcePageUrl = "${sourcePageLink}";
$destinationPagesUrls = @(${props.fileRefs.map(f => `\n            "${/[^/]*$/.exec(f)[0]}"`)}\n     );
function Get-SourceWebpartSettings {
    param(
        [int]$sectionNumber,
        [int]$columnNumber,
        [int]$controlNumber
    )
    $sourcePage = Get-PnPPage $sourcePageUrl;
    return $sourcePage.Sections[$sectionNumber].Columns[$columnNumber].Controls[$controlNumber].PropertiesJson;
};

function Update-DestinationWebpartSettings {
    param(
        [int]$sectionNumber,
        [int]$columnNumber,
        [int]$controlNumber,
        [string]$partId,
        $sourceWebPartProps
    )

    $savedPages = @();
    $skippedPages = @();

    $destinationPagesUrls | ForEach-Object {
        Write-Host "    --------------------------      " -ForegroundColor White;

        $destinationPageUrl = $_;
        $destinationPage = Get-PnPPage $destinationPageUrl;
        $destinationWebpart = $destinationPage.Sections[0].Columns[0].Controls[0];
        
        if ($null -ne $destinationWebpart -and $destinationWebpart.WebPartId -eq $partId -and $null -ne $sourceWebPartProps) {
            $destinationPage.Sections[$sectionNumber].Columns[$columnNumber].Controls[$controlNumber].PropertiesJson = $sourceWebPartProps;
            Write-Host "    Saving $destinationPageUrl" -ForegroundColor White;

            $destinationPage.Save() | Out-Null;
            $destinationPage.Publish();

            $savedPages += $destinationPageUrl;
            Write-Host "    Completed $destinationPageUrl" -ForegroundColor Green;
        }
        else {
            $skippedPages += $destinationPageUrl;
            Write-Host "    Skipped $destinationPageUrl" -ForegroundColor Yellow;
        }

        Write-Host "    --------------------------      " -ForegroundColor White;
    }

    Write-Host "    Saved pages:" -ForegroundColor Green;
    $savedPages | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Green;
    };

    Write-Host "    Skipped pages:" -ForegroundColor Yellow;
    $skippedPages | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Yellow;
    };

    Write-Host "    --------------------------      " -ForegroundColor White;
}

function Start-Copying {
    $sourceSectionNumber = ${sourceWebpartSectionVertical ? `0` : `${sourceWebpartSectionNumber}`};
    $sourceColumnNumber = ${sourceWebpartSectionVertical ? `1` : `${sourceWebpartColumnNumber}`};
    $sourceWebPartProps = Get-SourceWebpartSettings -sectionNumber $sourceSectionNumber -columnNumber $sourceColumnNumber -controlNumber ${sourceWebpartControlNumber};

    $destinationSectionNumber = ${destinationWebpartSectionVertical ? `0` : `${destinationWebpartSectionNumber}`};
    $destinationColumnNumber = ${destinationWebpartSectionVertical ? `1` : `${destinationWebpartColumnNumber}`};

    Update-DestinationWebpartSettings -sectionNumber $destinationSectionNumber -columnNumber $destinationColumnNumber -controlNumber ${destinationWebpartControlNumber} -partId "${sourceWebpartType?.key}" -sourceWebPartProps $sourceWebPartProps;    
}

Connect-PnPOnline "${props.siteUrl}" -UseWebLogin;
Start-Copying;
            `);
        }

    }, [sourcePageLink, sourceWebpartType,
        sourceWebpartSectionNumber, sourceWebpartColumnNumber, sourceWebpartControlNumber, sourceWebpartSectionVertical,
        destinationWebpartSectionNumber, destinationWebpartColumnNumber, destinationWebpartControlNumber, destinationWebpartSectionVertical]);

    return (
        <Dialog
            hidden={hideDialog}
            minWidth={800}
            dialogContentProps={{
                type: DialogType.largeHeader,
                title: "Copy PnP Search Webpart Settings",
                showCloseButton: true,
                closeButtonAriaLabel: 'Close',
            }}

            modalProps={{
                isBlocking: true,
            }}
            onDismiss={props.close}
        >
            <Stack styles={stackStyles} tokens={stackTokens}>

                {errorMessage &&
                    <Stack.Item align="stretch" styles={stackItemStyles}>
                        <MessageBar
                            messageBarType={MessageBarType.error}
                            isMultiline={false}
                            dismissButtonAriaLabel="Close">
                            {errorMessage}
                        </MessageBar>
                    </Stack.Item>
                }
                <Stack.Item align="stretch" styles={stackItemStyles}>
                    <Label styles={mainLabelStyles}>Source page related</Label>
                </Stack.Item>
                <Stack.Item align="stretch" styles={stackItemStyles}>
                    <TextField
                        label="Link"
                        value={sourcePageLink}
                        prefix={props.folderUrl}
                        required
                        onChange={(ev, newValue) => setSourcePageLink(newValue)}
                    />
                </Stack.Item>

                <Stack.Item align="stretch" styles={stackItemStyles}>
                    <Dropdown
                        placeholder="Select a version"
                        label="Search results webpart version"
                        options={searchDropdownOptions}
                        onChange={onSearchDropdownChange}
                        required
                    />
                </Stack.Item>

                <Stack horizontal styles={stackStyles} tokens={horizontalStackTokens}>
                    <Stack.Item grow styles={stackItemStyles}>
                        <Toggle label="Vertical section" onText="Yes" offText="No" onChange={onSourceSectionVerticalChange} checked={sourceWebpartSectionVertical} />
                    </Stack.Item>
                    <Stack.Item grow styles={stackItemStyles}>
                        <TextField
                            label="Section"
                            type="number"
                            required
                            value={sourceWebpartSectionNumber}
                            disabled={sourceWebpartSectionVertical}
                            onChange={(ev, newValue) => setSourceWebpartSectionNumber(newValue)}
                        />
                    </Stack.Item>
                    <Stack.Item grow styles={stackItemStyles}>
                        <TextField
                            label="Column"
                            type="number"
                            required
                            value={sourceWebpartColumnNumber}
                            onChange={(ev, newValue) => setSourceWebpartColumnNumber(newValue)}
                        />
                    </Stack.Item>
                    <Stack.Item grow styles={stackItemStyles}>
                        <TextField
                            label="Order"
                            type="number"
                            required
                            value={sourceWebpartControlNumber}
                            onChange={(ev, newValue) => setSourceWebpartControlNumber(newValue)}
                        />
                    </Stack.Item>
                </Stack>

                <Stack styles={stackStyles} tokens={stackTokens}>
                    <Stack.Item align="stretch" styles={stackItemStyles}>
                        <Label styles={mainLabelStyles}>Destination page(s) related</Label>
                    </Stack.Item>
                    <Stack horizontal styles={stackStyles} tokens={horizontalStackTokens}>
                        <Stack.Item grow styles={stackItemStyles}>
                            <Toggle label="Vertical section" onText="Yes" offText="No" onChange={onDestinationSectionVerticalChange} checked={destinationWebpartSectionVertical} />
                        </Stack.Item>
                        <Stack.Item grow styles={stackItemStyles}>
                            <TextField
                                label="Section"
                                type="number"
                                required
                                value={destinationWebpartSectionNumber}
                                disabled={destinationWebpartSectionVertical}
                                onChange={(ev, newValue) => setDestinationWebpartSectionNumber(newValue)}
                            />
                        </Stack.Item>
                        <Stack.Item grow styles={stackItemStyles}>
                            <TextField
                                label="Column"
                                type="number"
                                required
                                value={destinationWebpartColumnNumber}
                                onChange={(ev, newValue) => setDestinationWebpartColumnNumber(newValue)}
                            />
                        </Stack.Item>
                        <Stack.Item grow styles={stackItemStyles}>
                            <TextField
                                label="Order"
                                type="number"
                                required
                                value={destinationWebpartControlNumber}
                                onChange={(ev, newValue) => setDestinationWebpartControlNumber(newValue)}
                            />
                        </Stack.Item>
                    </Stack>


                </Stack>

                <Stack horizontal styles={stackStyles} tokens={horizontalStackTokens}>
                    {
                        destinationPagesSuccessful?.length > 0 &&

                        <Stack.Item grow styles={stackItemStyles}>
                            <Label>Successfully completed pages</Label>
                            <div className={styles.container} data-is-scrollable>
                                <List
                                    items={destinationPagesSuccessful}
                                    onRenderCell={onRenderCell}
                                />
                            </div>
                        </Stack.Item>
                    }
                    {
                        destinationPagesUnsuccessful?.length > 0 &&

                        <Stack.Item grow styles={stackItemStyles}>
                            <Label>Pages that need attention</Label>
                            <div className={styles.container} data-is-scrollable>
                                <List
                                    items={destinationPagesUnsuccessful}
                                    onRenderCell={onRenderCell}
                                />
                            </div>
                        </Stack.Item>
                    }
                </Stack>

                <Stack styles={stackStyles} tokens={stackTokens} >
                    <Toggle label="Show PnP JS code" onText="Yes" offText="No" onChange={onShowPnPJSCodeChange} checked={showPnPJSCode} disabled={!allDataOk} />
                    {
                        showPnPJSCode && allDataOk &&

                        <AceEditor
                            placeholder="Copy search results settings code"
                            mode="typescript"
                            theme="monokai"
                            name="pnpJSCodeEditor"
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            width={"740px"}
                            height={"300px"}
                            value={pnpjsCode}
                            setOptions={{
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: false,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 2,
                            }} />
                    }

                    <Toggle label="Show PnP PoweShell code" onText="Yes" offText="No" onChange={onShowPnPPSCodeChange} checked={showPnPPSCode} disabled={!allDataOk} />
                    {
                        showPnPPSCode && allDataOk &&

                        <AceEditor
                            placeholder="Copy search results settings code"
                            mode="ruby"
                            theme="monokai"
                            name="pnpPSCodeEditor"
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            width={"740px"}
                            height={"300px"}
                            value={pnpPSCode}
                            setOptions={{
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: false,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 2,
                            }} />
                    }
                </Stack>

            </Stack>

            <DialogFooter>
                <PrimaryButton onClick={getSourceWebpartSettings} disabled={loading || !allDataOk} text={"Submit"}>
                    {loading && <Spinner size={SpinnerSize.small} />}
                </PrimaryButton>
                <DefaultButton onClick={() => { props.close(); reset(); }} text="Cancel" />
            </DialogFooter>

        </Dialog>

    );



};

export default WorkerDialog;