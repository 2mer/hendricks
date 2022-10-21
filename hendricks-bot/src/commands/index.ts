import play from './play';
import ICommand from '../types/ICommand';
import exit from './exit';

export default [play, eval, exit] as ICommand[];
