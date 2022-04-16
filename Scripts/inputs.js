export default class Inputs{

    generateInputs(size){
        let form = document.getElementById('inputMatrixGroup')
        let inputMatrixGroup = document.getElementById('inputMatrixGroup')

        let factor = document.getElementById('factor')
        factor.value = 1/(size*size)

        inputMatrixGroup.style.cssText = `
                grid-template-columns:  repeat(${size}, 1fr);
                grid-template-rows:     repeat(${size+1}, 1fr);`

        form.innerHTML= ''
        for (let i = 0; i < size*size; i++) {
            let input = document.createElement('input');
            input.setAttribute('type', 'number');
            input.setAttribute('max',  100);
            input.setAttribute('step', 0.001);
            input.setAttribute('min', -1000);
            input.setAttribute('class', 'inputMatrix');
            input.setAttribute('value', 1);
            form.appendChild(input);
        }
        let btn = document.createElement('button');
        btn.textContent= 'Calcular'
        btn.setAttribute('type', 'submit');
        btn.setAttribute('class', 'btn');
        btn.setAttribute('class', 'btn-primary');
        btn.style.cssText =`grid-column: 1/${size+1}`
        form.appendChild(btn);
    }

    getInputMatrix(){
        let form = document.getElementById('inputMatrixGroup').elements
        let factor = parseFloat(document.getElementById('factor').value)

        let array = new Array()
        for (let i = 0; i < form.length-1; i++) {
            array.push(parseFloat(form[i].value)*factor)
        }
        return array;
    }
    
}