import play from './play';
import ICommand from '../types/ICommand';
import exit from './exit';
import stats from './stats';

export default [play, exit, stats] as ICommand[];
