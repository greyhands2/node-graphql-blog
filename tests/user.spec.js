import {getFirstName} from '../src/helpers/user.js'

test('should return first name when given full name', ()=>{
    const firstName = getFirstName('Osagie Osemwota')
    
    expect(firstName).toBe('Osagie')
})

