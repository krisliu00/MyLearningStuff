from django import forms
from .models import AuctionList

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True
    
class MultipleFileField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = [single_file_clean(data, initial)]
        return result

class SellList(forms.ModelForm):
    class Meta:
        model = AuctionList
        fields = ['images','category','title', 'description', 'price']
    
    images = MultipleFileField(label='Upload Images', required=True)
    category = forms.ChoiceField(choices=AuctionList.category_choices)
    
    def clean_image(self):
        images = self.cleaned_data.get('images')
        if not images:
            raise forms.ValidationError('Please upload at least one image.')
        return images

    def clean(self):
        cleaned_data = super().clean()
        images = cleaned_data.get('images', [])
        if len(images) > 5:
            raise forms.ValidationError('You can upload a maximum of 5 pictures.')
        return cleaned_data