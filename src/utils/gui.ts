import { Text } from 'phaser-ce';
import { tokenizeTextStyle } from './textStyle';

export function changeInputEnabled(displayObj,enabled): void{
  if (displayObj.input){
    displayObj.input.enabled = enabled;
  }
  for (const child of displayObj.children){
    changeInputEnabled(child,enabled);
  }

}

// sets text styles tags in a phaser text object (but NOT the text itself)
// returns final text without tags, that has to be set to text object as textObj.text
export function setTextStyles(text: string,textObj: Text): string {
  const tokens = tokenizeTextStyle(text);
  textObj.clearFontValues();
  textObj.clearColors();
  const styles: {
    start: number;
    end: number;
    style: string;
    color?: string;
  }[] = [];
  const stack: typeof styles = []
  let token: typeof tokens[number];
  let result = '';
  while(tokens.length){
    token = tokens.shift();
    if (token.text !== undefined) {
      result += token.text;
    } else {
      const [style, color] = token.tag.split(':');
      if (style === 'end') {
        // find the most recent unclosed style on the stack and close it
        const lastStyle = stack.pop();
        if (lastStyle) {
          lastStyle.end = result.length;
        }
      } else {
        // add new unclosed style onto the stack
        styles.push({
          start: result.length,
          end: -1,
          style,
          color,
        });
        stack.push(styles[styles.length-1]);
      }
    }
  }
  styles.forEach(s=>{
    if (s.style==='italic'){
      textObj.addFontStyle('italic', s.start);
      textObj.addFontStyle('normal', s.end);
    }
    if (s.style==='bold'){
      textObj.addFontWeight('bold', s.start);
      textObj.addFontWeight('normal', s.end);
    }
    if (s.style==='color'){
      textObj.addColor(s.color, s.start);
      textObj.addColor(textObj.fill, s.end);
    }
  })
  return result;
}


/**
 * compareFn for hud config elements.
 * ensures that name box is on top of dialogue,
 * and that choices and buttons are on top of both
 */
export function hudSort(a: { type: string }, b: { type: string }): number {
  const order = [
    'messageBox',
    'nameBox',
    'button',
    'choices',
  ];
  const idxA = order.indexOf(a.type);
  const idxB = order.indexOf(b.type);
  if (idxA === undefined || idxB === undefined) return 0;
  return idxA - idxB;
}
