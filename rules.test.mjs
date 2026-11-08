import test from 'node:test';
import assert from 'node:assert/strict';
import {START,legalTargets,move,sideOf,opposite,inCheck,result} from './public/rules.mjs';
function perft(board,side,depth){
  if(!depth)return 1;
  let nodes=0;
  for(let i=0;i<90;i++)if(sideOf(board[i])===side)
    for(const to of legalTargets(board,i))nodes+=perft(move(board,i,to),opposite(side),depth-1);
  return nodes;
}
test('start position legal move tree',()=>{
  assert.equal(START.length,90);assert.equal(perft(START,'red',1),44);
  assert.equal(perft(START,'red',2),1920);assert.equal(perft(START,'red',3),79666);
});
function position(pieces){
  const board=Array(90).fill('.');
  for(const [i,p] of Object.entries(pieces))board[i]=p;
  return board.join('');
}
test('cannot expose facing generals',()=>{
  const board=position({4:'k',85:'K',49:'R'});
  assert.equal(inCheck(board,'red'),false);
  assert.equal(legalTargets(board,49).includes(48),false);
});
test('horse leg and elephant eye block movement',()=>{
  const board=position({4:'k',85:'K',49:'P',82:'N',73:'P',83:'B',75:'P'});
  assert.ok(!legalTargets(board,82).includes(65));assert.ok(!legalTargets(board,83).includes(67));
});
test('cannon needs exactly one screen to capture',()=>{
  let board=position({4:'k',85:'K',49:'P',64:'C',37:'p',19:'n'});
  assert.ok(legalTargets(board,64).includes(19));assert.ok(!legalTargets(board,64).includes(37));
});
test('stalemate loses',()=>{
  const board=position({4:'k',84:'K',12:'R',14:'R',22:'P'});
  assert.equal(inCheck(board,'black'),false);assert.match(result(board,'black',[]),/红方胜 · 困毙/);
});
