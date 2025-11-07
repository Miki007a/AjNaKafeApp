<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function all($keys = null)
    {
        \Log::info('Incoming Request Data:', $this->input());
        return parent::all($keys);
    }
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $userId = $this->user->id; // Replace this with the way you retrieve the user's ID

        return [
            'name' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users,email,' . $userId], // Ignore current user's email
            'gender' => ['required', 'string'],
            'preference' => ['required', 'string'],
            'location' => ['required', 'string'],
            'date' => ['required', 'string'],
            'telephone' => [
                'required',
                'string',
                'regex:/^\+389[0-9]{8}$/',
                'unique:users,telephone,' . $userId // Ignore current user's telephone
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->symbols()
                    ->numbers()
            ]
        ];
    }

}
