import * as React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import Reporting from './Reporting';
//import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/themes/bootstrap4-light-purple/theme.css";
//import "primereact/resources/themes/tailwind-light/theme.css";

//import 'primeicons/primeicons.css';

export interface IContainerProps {    
    isDarkTheme: boolean;
    environmentMessage: string;
    hasTeamsContext: boolean;
    userDisplayName: string;
}


const Container: React.FC<IContainerProps> = (props) => {    

    return (
        <PrimeReactProvider>
            <Reporting {...props} />
        </PrimeReactProvider>
    );
};

export default Container;