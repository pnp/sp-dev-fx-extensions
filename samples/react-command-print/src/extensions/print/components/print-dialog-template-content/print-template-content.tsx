import * as React from 'react';
import ReactHtmlParser from 'react-html-parser';
import styles from './print-template-content.module.scss';
import IPrintTemplateProps from './print-template-props';


class PrintTemplateContent extends React.Component<IPrintTemplateProps, {}>{

    constructor(props) {
        super(props);
    }
    public render() {
        return (
            <div className={styles.Print}>
                {this.props.template &&
                    <div className={styles.Print}>
                        <div className={styles.printHeader}>
                            {ReactHtmlParser(this.props.template.header)}
                        </div>
                        <div className={styles.printContent}>
                            {
                                this.props.template.content
                            }
                        </div>
                        <div className={styles.printFooter}>
                            {ReactHtmlParser(this.props.template.footer)}
                        </div>

                    </div>
                }
            </div>
        );
    }

}

export default PrintTemplateContent;