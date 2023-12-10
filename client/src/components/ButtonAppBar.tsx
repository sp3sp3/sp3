import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { ButtonBase } from '@mui/material';
import { Link } from 'react-router-dom';

export const ButtonAppBar = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                    </IconButton>
                    <ButtonBase component={Link} to={'/'}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            sp3
                        </Typography>
                    </ButtonBase>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
