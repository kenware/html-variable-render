const fs = require('fs')

class HtmlVariableRender {
  static fromString(data, variables={}){
    String.prototype.replaceAt = function(start, end, replacement) {
      return this.substring(0, start) + replacement + this.substring(end, this.length);
    }
    Object.entries(variables).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        let proceed = true
        while(data.indexOf(`{{#for ${key}}}`) > 0 && data.indexOf(`{{#endfor ${key}}}`) > 0 && proceed) {
          const indexOne = data.indexOf(`{{#for ${key}}}`)
          const indexTwo = data.indexOf(`{{#endfor ${key}}}`)
          let newValue = ''
          const dataItem = data.substring(indexOne + `{{#for ${key}}}`.length, indexTwo)
          const lastChar = `${key}`.substring(`${key}`.length - 1)
          let replaceKey = key
          if (lastChar === 's'){
              replaceKey = `${key}`.substring(0, `${key}`.length - 1);
          }
          value.forEach(item => {
              let replaceableItem = dataItem
              if (typeof item === 'object' && item !== null) {
                  Object.entries(item).forEach(([i,k]) => {
                    replaceableItem = replaceableItem.replace(`{{${replaceKey}.${i}}}`, k)
                  })
              }else{
                replaceableItem = replaceableItem.replace(`{{${replaceKey}}}`, item)
              }
              newValue += replaceableItem
          })
          data = data.replaceAt(indexOne, indexTwo + `{{#endfor ${key}}}`.length, newValue)
        }
      }else{
        data = data.replaceAll(`{{${key}}}`, value)
        if (value) {
          data = data.replaceAll(`{{#if ${key}}}`, ' ')
          data = data.replaceAll(`{{#endif ${key}}}`, ' ')
        }else{
        while (data.indexOf(`{{#if ${key}}}`) > 0 && data.indexOf(`{{#endif ${key}}}`) > 0) {
          const indexOne = data.indexOf(`{{#if ${key}}}`)
          const indexTwo = data.indexOf(`{{#endif ${key}}}`)
          data = data.replaceAt(indexOne, indexTwo + `{{#endif ${key}}}`.length, ' ')
        }
        }
      }
    })
    return data  
  }

  static getRawDataFromPath(filepPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filepPath, 'UTF-8', function(err, data){
        if(err) reject(err)
        resolve(data)
       });
    })

  }
  static async fromPath(filePath, variables={}){
    try{
    const raw = await this.getRawDataFromPath(filePath)
    return this.fromString(raw, variables)
    }catch(err) {
      throw new Error(err.message)
    }
  }
}

module.exports = HtmlVariableRender;
