/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: FileUploadComponent,
            multi: true,
        },
    ],
    styleUrls: ['./file-upload.component.scss'],
    imports: [MatButtonModule]
})
export class FileUploadComponent implements ControlValueAccessor {
  onChange!: Function;
  public file: File | null = null;

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    console.log('event',event.item(0));
    
    const file = event && event.item(0);
    this.onChange(file);
    this.file = file;
  }

  constructor(private host: ElementRef<HTMLInputElement>) { }

  writeValue(value: null) {
    console.log('value',value);
    
    // clear file input
    this.host.nativeElement.value = '';
    this.file = null;
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
    console.log('this.onChange',this.onChange);
    
  }

  registerOnTouched(fn: Function) {
    // add code here
  }
}
