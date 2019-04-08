import * as React from 'react';
import { ILogoFestoonProps } from './ILogoFestoonProps';
import '../festoon.css';
export class LogoFestoon extends React.Component<ILogoFestoonProps, {}> {
    constructor(props) {
        super(props);
    }
    public componentWillUnmount() {
        console.log('Unmounting the header component.');
      }
    public render(): React.ReactElement<ILogoFestoonProps> {
        let festivusStyle = {};
        switch (this.props.direction) {

            case "top-right":
                festivusStyle = {
                    left: this.props.widthval
                };
                break;
            case "bottom-right":
                festivusStyle = {
                    left: this.props.widthval,
                    top: this.props.widthval
                };
                break;
            case "bottom-left":
                festivusStyle = {
                    top: this.props.widthval
                };
                break;
            default:
                festivusStyle = {}; //top-left
        }
        return (
            <div>
                <img alt={this.props.alt} className="img-festoon" style={festivusStyle} src={this.props.imageUrl}></img>
            </div>
        );
    }
}