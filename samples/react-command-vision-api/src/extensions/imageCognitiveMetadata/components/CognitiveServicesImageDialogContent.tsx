import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ICognitiveServicesImage } from '../ICognitiveServicesImage';
import DocumentCardTags from './DocumentCardTags';

import {
    autobind,
    PrimaryButton,
    CommandButton,
    Label,
    DialogFooter,
    DialogContent,
    DialogType,
    SwatchColorPicker,
    Icon
} from 'office-ui-fabric-react';

import styles from './CognitiveServicesImageDialogContent.module.scss';


export interface ICognitiveServicesImageDialogContentProps {
    cognitiveServicesImage: ICognitiveServicesImage;
    close: () => void;
}

export default class CognitiveServicesImageDialogContent extends React.Component<ICognitiveServicesImageDialogContentProps, {}> {

    constructor(props) {
        super(props);
    }

    public render(): React.ReactElement<ICognitiveServicesImageDialogContentProps> {

        return (<div className={styles.CognitiveServicesImageDialogContent}>
            <DialogContent
                title={"Vision API Analyse Result"}
                subText={"This is the infromation returned by the Cognitive Services Vision API Analysis"}
                onDismiss={this.props.close}
                showCloseButton={true}
                type={DialogType.close} >

                <h1>{this.props.cognitiveServicesImage.description.captions[0].text}</h1>                
                
                <Label>({this.props.cognitiveServicesImage.metadata.width} x {this.props.cognitiveServicesImage.metadata.height}) [{this.props.cognitiveServicesImage.metadata.format}]</Label>

                <Label className={styles.clear}>Tags found on image:</Label>
                <DocumentCardTags tags={this.props.cognitiveServicesImage.description.tags}></DocumentCardTags>

                <Label className={styles.clear}>Colours found on image:</Label>
                <SwatchColorPicker
                    columnCount={3}
                    cellShape={'circle'}
                    colorCells={
                        [
                            { id: 'a', label: 'accentColor', color: `#${this.props.cognitiveServicesImage.color.accentColor}` },
                            { id: 'c', label: 'dominantColorBackground', color: this.props.cognitiveServicesImage.color.dominantColorBackground },
                            { id: 'd', label: 'dominantColorForeground', color:  this.props.cognitiveServicesImage.color.dominantColorForeground}
                        ]
                    } />      

                <DialogFooter>
                    <CommandButton text='Close' title='Close' onClick={this.props.close} />
                </DialogFooter>

            </DialogContent>
        </div>);
    }
}