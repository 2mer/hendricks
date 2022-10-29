import IReplHandler from '../types/IReplHandler';
import bash from './bash';
import node from './node';
import python from './python';
import tsNode from './ts-node';

export default [node, tsNode, python, bash] as IReplHandler[];
