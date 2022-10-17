import imagine from './imagine';
import play from './play';
import Command from '../types/Command';
import eval from './eval';
import queued from './queued';
import exit from './exit';

export default [imagine, play, eval, queued, exit] as Command[];