import { ButtonAppBar } from './components/ButtonAppBar'
import { ProjectOverview } from './pages/ProjectOverview'
import { ThemeProvider, createTheme } from '@mui/material/styles';
// import './index.css'


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
                <ButtonAppBar />
                <ProjectOverview />
            </ThemeProvider>
        </>
    )
}

export default App
