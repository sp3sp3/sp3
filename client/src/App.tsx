import { ButtonAppBar } from './components/ButtonAppBar'
import { ProjectOverview } from './pages/ProjectOverview'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#263238',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: "#fff"
        },
        text: {
            primary: "#000001de",
            secondary: "#00000099",
        }
    },
    typography: {
        // fontFamily: 'Roboto Mono',
    },
};

const theme = createTheme(themeOptions)

function App() {
    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <ButtonAppBar />
                    <ProjectOverview />
                </CssBaseline>
            </ThemeProvider>
        </>
    )
}

export default App
